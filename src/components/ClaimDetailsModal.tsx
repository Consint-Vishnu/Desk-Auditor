/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X, MessageSquare } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchClaimFindings, fetchRules, Rule, addFinding, addRule } from '@/services/api/auditService';

interface Finding {
  id: string;
  description: string;
  status?: 'accepted' | 'declined' | 'pending';
  remarks?: string;
}

export interface ClaimDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimData: any;
}

const ClaimDetailsModal: React.FC<ClaimDetailsModalProps> = ({
  isOpen,
  onClose,
  claimData
}) => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<{ruleName: string; ruleId: string} | null>(null);
  const [isRemarksOpen, setIsRemarksOpen] = useState(false);
  const [activeFindingId, setActiveFindingId] = useState<string | null>(null);
  const [remarkText, setRemarkText] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [rules, setRules] = useState<Rule[]>([]);
  const [isNewRuleDialogOpen, setIsNewRuleDialogOpen] = useState(false);
  const [newRuleName, setNewRuleName] = useState("");
  const { toast } = useToast();

  // Load any existing findings for this claim
  useEffect(() => {
    const loadFindings = async () => {
      if (claimData?.claimNumber) {
        try {
          const response = await fetchClaimFindings(claimData.claimNumber);
          const transformedFindings = response.data.map((finding, index) => ({
            id: `${finding.ClaimId}-${index}`, // Create unique id by combining ClaimId and index
            description: finding.FraudTrigger,
            status: finding.ClaimStatus as 'accepted' | 'declined' | 'pending' || 'pending',
            remarks: '',
          }));
          setFindings(transformedFindings);
        } catch (error) {
          console.error('Error loading findings:', error);
          toast({
            title: "Error",
            description: "Failed to load findings",
            variant: "destructive",
          });
        }
      }
    };

    loadFindings();
  }, [claimData.claimNumber, toast]); // Also changed dependency from id to claimNumber

  // Load rules
  useEffect(() => {
    const loadRules = async () => {
      try {
        const response = await fetchRules();
        setRules(response.data);
      } catch (error) {
        console.error('Error loading rules:', error);
        toast({
          title: "Error",
          description: "Failed to load rules",
          variant: "destructive",
        });
      }
    };

    loadRules();
  }, [toast]);

  const handleFindingSelect = (value: string) => {
    const selectedRule = rules.find(rule => rule.RuleName === value);
    if (selectedRule) {
      // Get the highest rule number
      const highestRuleId = rules.reduce((highest, rule) => {
        const currentNumber = parseInt(rule.RuleId.split('-')[1]);
        return currentNumber > highest ? currentNumber : highest;
      }, 0);

      // Generate new rule ID with padding
      const newRuleNumber = (highestRuleId + 1).toString().padStart(4, '0');
      const newRuleId = `RUL-${newRuleNumber}`;

      setSelectedFinding({
        ruleName: selectedRule.RuleName,
        ruleId: newRuleId // Use the new incremented rule ID
      });
    }
    setOpenCombobox(false);
  };

  const handleAddFinding = async () => {
    if (selectedFinding && claimData?.claimNumber) {
      try {
        // Call the API to add the finding
        const response = await addFinding({
          rule_id: selectedFinding.ruleId,
          claim_id: claimData.claimNumber,
          fraud_trigger: selectedFinding.ruleName
        });

        if (response.status) {
          // Only update local state if API call was successful
          setFindings([
            ...findings,
            { 
              id: `${claimData.claimNumber}-${Date.now()}`,
              description: selectedFinding.ruleName,
              status: 'pending'
            }
          ]);
          
          setSelectedFinding(null);
          setOpenCombobox(false);
          
          toast({
            title: "Finding Added",
            description: response.message || "New finding has been added successfully",
          });
        }
      } catch (error) {
        console.error('Error adding finding:', error);
        toast({
          title: "Error",
          description: "Failed to add finding",
          variant: "destructive",
        });
      }
    }
  };

  const handleCreateRule = async () => {
    if (!newRuleName.trim()) return;

    try {
      const response = await addRule({ rule_name: newRuleName.trim() });
      if (response.status) {
        // Refresh rules list
        const rulesResponse = await fetchRules();
        setRules(rulesResponse.data);
        
        setNewRuleName("");
        setIsNewRuleDialogOpen(false);
        toast({
          title: "Success",
          description: "New finding rule created successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new rule",
        variant: "destructive",
      });
    }
  };

  const updateFindingStatus = (id: string, status: 'accepted' | 'declined') => {
    setFindings(findings.map(finding => 
      finding.id === id ? { ...finding, status } : finding
    ));
    toast({
      title: `Finding ${status === 'accepted' ? 'Accepted' : 'Declined'}`,
      description: `The finding has been ${status}`,
      variant: status === 'accepted' ? 'default' : 'destructive',
    });
  };

  const openRemarksSheet = (id: string) => {
    setActiveFindingId(id);
    const finding = findings.find(f => f.id === id);
    setRemarkText(finding?.remarks || "");
    setIsRemarksOpen(true);
  };

  const saveRemarks = () => {
    if (activeFindingId) {
      setFindings(findings.map(finding => 
        finding.id === activeFindingId ? { ...finding, remarks: remarkText } : finding
      ));
      setIsRemarksOpen(false);
      setActiveFindingId(null);
      toast({
        title: "Remarks Saved",
        description: "Your remarks have been saved successfully",
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-[90vw] w-full h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="py-3 px-4 border-b bg-white sticky top-0 z-10">
            <DialogTitle className="text-lg font-bold text-center">
              Claim Details: {claimData?.claimNumber || 'Loading...'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-row h-[calc(90vh-60px)]">
            {/* Left side - Document viewer */}
            <div className="w-2/5 py-3 px-4 bg-gray-100 h-full flex flex-col">
              <h4 className="text-md font-semibold mb-2">Documents</h4>
              <div className="bg-white rounded-lg shadow p-3 text-center text-gray-500 overflow-auto flex-grow mb-2">
                <p className="text-sm">Document viewer to be implemented</p>
              </div>
            </div>
            
            {/* Right side - Fraud findings */}
            <div className="w-3/5 py-3 px-4 bg-white h-full flex flex-col">
              <h3 className="text-md font-semibold mb-3">Fraud Findings</h3>
              
              <div className="border rounded-lg overflow-hidden shadow-sm flex-grow flex flex-col">
                {/* Table header - fixed */}
                <div className="grid grid-cols-12 bg-blue-900 text-white py-2 px-3 sticky top-0">
                  <div className="col-span-4 font-medium text-sm text-left">Finding</div>
                  <div className="col-span-5 font-medium text-sm text-center">Action</div>
                  <div className="col-span-3 font-medium text-sm text-center">Remarks</div>
                </div>
                
                {/* Table rows - scrollable */}
                <div className="flex-grow overflow-auto">
                  {findings.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No findings available
                    </div>
                  ) : (
                    findings.map((finding) => (
                      <div 
                        key={finding.id} 
                        className="grid grid-cols-12 border-t py-2 px-3 hover:bg-gray-50 items-center"
                      >
                        <div className="col-span-4 flex items-center font-medium text-gray-700 text-sm text-left pr-2">
                          {finding.description}
                        </div>
                        <div className="col-span-5 flex items-center justify-center gap-2">
                          <Button 
                            size="sm"
                            variant={finding.status === 'accepted' ? 'default' : 'outline'}
                            className={`px-2 py-1 h-7 text-xs rounded-md shadow-sm ${
                              finding.status === 'accepted' ? 'bg-green-500 text-white' : ''
                            }`}
                            onClick={() => updateFindingStatus(finding.id, 'accepted')}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            size="sm"
                            variant={finding.status === 'declined' ? 'destructive' : 'outline'}
                            className={`px-2 py-1 h-7 text-xs rounded-md shadow-sm ${
                              finding.status === 'declined' ? 'bg-red-500 text-white' : ''
                            }`}
                            onClick={() => updateFindingStatus(finding.id, 'declined')}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                        <div className="col-span-3 flex justify-center">
                          <Button 
                            size="sm"
                            variant="default"
                            className="h-7 px-2 py-1 text-xs rounded-md shadow-sm bg-blue-500"
                            onClick={() => openRemarksSheet(finding.id)}
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {finding.remarks ? "Edit" : "Add"}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* New finding input row - fixed at bottom */}
                <div className="grid grid-cols-12 border-t py-2 px-3 bg-gray-50 items-center">
                  <div className="col-span-7">
                    <Select 
                      value={selectedFinding?.ruleName || ''} 
                      onValueChange={handleFindingSelect}
                    >
                      <SelectTrigger className="w-full h-8 bg-white text-sm">
                        <SelectValue placeholder="Enter New Finding..." />
                      </SelectTrigger>
                      <SelectContent>
                        {rules.map(rule => (
                          <SelectItem key={rule.RuleId} value={rule.RuleName}>
                            {rule.RuleName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 pl-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-8 text-xs"
                      onClick={() => setIsNewRuleDialogOpen(true)}
                    >
                      Create New
                    </Button>
                  </div>
                  <div className="col-span-3 pl-2">
                    <Button 
                      size="sm"
                      variant="default"
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 shadow-sm font-medium w-full h-8 text-xs"
                      onClick={handleAddFinding}
                      disabled={!selectedFinding}
                    >
                      Add Finding
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Footer button */}
              <div className="flex justify-end mt-3">
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={onClose}
                  className="px-3 py-1 h-8 text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remarks Sheet */}
      <Sheet open={isRemarksOpen} onOpenChange={setIsRemarksOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add Remarks</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <Textarea 
              placeholder="Enter your remarks here..."
              className="min-h-[200px] resize-none"
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
            />
          </div>
          <SheetFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsRemarksOpen(false)}>Cancel</Button>
            <Button onClick={saveRemarks} className="ml-2">Save Remarks</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Alert Dialog for Remarks */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Remarks</AlertDialogTitle>
            <AlertDialogDescription>
              <Textarea 
                placeholder="Enter your remarks here..."
                className="min-h-[150px] mt-2 resize-none"
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={saveRemarks}>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Rule Dialog */}
      <Dialog open={isNewRuleDialogOpen} onOpenChange={setIsNewRuleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Finding Rule</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="ruleName" className="text-sm font-medium">
                Rule Name
              </label>
              <Input
                id="ruleName"
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
                placeholder="Enter new finding rule..."
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewRuleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateRule}
              disabled={!newRuleName.trim()}
            >
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClaimDetailsModal;