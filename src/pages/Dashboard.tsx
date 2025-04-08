import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { toast } from "sonner";
import { useAuth, UserRole } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import HeaderFilters from '../components/HeaderFilters';
import AuditTable from '../components/AuditTable';
import FilterPanel from '../components/FilterPanel';
import { fetchDeskAudits, DeskAuditParams, DeskAuditItem } from '../services/api/auditService';
import { fetchSubUsers } from '../services/api/userService';
import { format } from 'date-fns';

interface DashboardParams {
  role: UserRole;
}

// Updated AuditData to match the DeskAuditItem interface structure from API
interface AuditData {
  id: string;
  claimNumber: string;
  claimDate: string;
  hospitalName: string;
  hospitalLocation: string;
  htpaLocation: string;
  dateOfAdmission: string;
  dateOfDischarge: string;
  fraudTriggers: string;
  fieldInvestigationDate: string;
  claimStatus: string;
  status: string;
  deskAuditReferralDate: string;
  taTCompliance: string;
  claimIntimationAging: string;
  aiManualTrigger: string;
  allocation?: string;
  fieldReport: string;
}

const Dashboard: React.FC = () => {
  const { role } = useParams<{ role: string }>() as { role: UserRole };
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState<AuditData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [subUsers, setSubUsers] = useState<any[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });
  const [filters, setFilters] = useState<{
    startDate: string;
    endDate: string;
    triggerType: string;
  }>({
    startDate: '2023-01-01', // Default to 2023-01-01
    endDate: '2024-01-01',   // Default to 2024-01-01
    triggerType: 'Ai',       // Default trigger type
  });

  // Fetch sub-users based on role
  const fetchUsersByRole = async () => {
    if (role === 'ro_admin' || role === 'ho_admin') {
      try {
        const users = await fetchSubUsers();
        setSubUsers(users);
      } catch (error: any) {
        console.log(error);
        toast.error(error.message || 'Failed to fetch users');
      }
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const params: DeskAuditParams = {
        start_date: filters.startDate,
        end_date: filters.endDate,
        page_no: pagination.page,
        page_size: pagination.pageSize,
        trigger_type: ''
      };
      
      const response = await fetchDeskAudits(params);
      
      console.log('data response',response.data);

      // Map API response to AuditData format
      const mappedData: AuditData[] = response.data.map(item => ({
        id: item.Id.toString(),
        claimNumber: item.ClaimId,
        claimDate: item.ClaimedDate,
        hospitalName: item.HospitalId, // This might need to be fetched separately
        hospitalLocation: '',
        htpaLocation: item.HitpaLocation || 'No Data',
        dateOfAdmission: item.DateOfAdmission,
        dateOfDischarge: item.DateOfDischarge,
        fraudTriggers: item.FraudTrigger,
        fieldInvestigationDate: item.FraudInvestigationDate || 'No Data',
        claimStatus: item.ClaimStatus || 'No Data',
        status: item.ClaimStatus || 'Pending', // Using ClaimStatus or default to 'Pending'
        deskAuditReferralDate: item.DeskAuditReferralDate || 'No Data',
        taTCompliance: item.TatCompliance || 'No Data',
        claimIntimationAging: item.ClaimIntimationAging || 'No Data',
        aiManualTrigger: item.TriggerType,
        allocation: '', // Will be populated from sub-users if needed
        fieldReport: '' // Not available in API response
      }));

      // console.log('mappedData',mappedData);
      setData(mappedData);
      setTotalItems(response.total_rec);
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch audit data');
      setLoading(false);
      setData([]);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      fetchUsersByRole();
    }
  }, [pagination.page, pagination.pageSize, isAuthenticated]);

  useEffect(() => {
    // Listen for sidebar expansion/collapse
    const handleSidebarChange = () => {
      const sidebar = document.querySelector('[class*="w-64"]');
      setSidebarExpanded(!!sidebar);
    };
    
    // Create a MutationObserver to detect class changes on the sidebar
    const observer = new MutationObserver(handleSidebarChange);
    const sidebarElement = document.querySelector('div[class*="flex flex-col h-screen fixed"]');
    
    if (sidebarElement) {
      observer.observe(sidebarElement, { attributes: true, attributeFilter: ['class'] });
    }
    
    return () => observer.disconnect();
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Make sure user can only access their role's dashboard
  if (user?.role !== role) {
    toast.error(`You don't have permission to access the ${role} dashboard`);
    return <Navigate to={`/dashboard/${user?.role}`} />;
  }

  const handleFilter = (filters: any) => {
    setLoading(true);
    
    // Update filters state with the new values
    setFilters({
      startDate: filters.startDate || '2023-01-01',
      endDate: filters.endDate || '2024-01-01',
      triggerType: filters.triggerType || 'Ai'
    });
    
    // Reset pagination to first page
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    
    // Fetch data with updated filters
    fetchData();
  };

  const handleExport = () => {
    toast.success('Exporting data to Excel...');
    // In a real app, you would generate and download an Excel file
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({
      ...prev,
      page
    }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination({
      page: 1, // Reset to first page when changing page size
      pageSize
    });
  };
  
  const handleAdvancedFilter = () => {
    setIsFilterPanelOpen(true);
  };

  const handleApplyAdvancedFilters = (advancedFilters: any) => {
    // Apply advanced filters here
    toast.success('Applied advanced filters');
    // You would update the fetch params with these filters
  };

  // Generate title based on role
  const getDashboardTitle = () => {
    switch (role) {
      case 'ro_admin':
        return 'Desk Audit Module - RO Admin';
      case 'ho_admin':
        return 'Desk Audit Module - HO Admin';
      case 'desk_auditor':
        return 'Desk Audit Module - Desk Audit';
      default:
        return 'Desk Audit Module';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className={`flex-1 overflow-hidden transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-[50px]'}`}>
        <div className="p-2 h-full flex flex-col">
          <div className="bg-white rounded-lg shadow-sm p-2 mb-2">
            <h1 className="text-lg font-bold text-gray-800 mb-1">
              {getDashboardTitle()}
            </h1>
            
            <HeaderFilters 
              onFilter={handleFilter}
              onExport={handleExport}
              onAdvancedFilter={handleAdvancedFilter}
              defaultFilters={{
                startDate: filters.startDate,
                endDate: filters.endDate,
                triggerType: filters.triggerType
              }}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm flex-1 overflow-hidden flex flex-col">
            <AuditTable 
              data={data}
              loading={loading}
              paginationProps={{
                page: pagination.page,
                pageSize: pagination.pageSize,
                total: totalItems,
                onPageChange: handlePageChange,
                onPageSizeChange: handlePageSizeChange
              }}
              subUsers={subUsers}
              userRole={role}
            />
          </div>
        </div>
      </div>
      
      <FilterPanel 
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        onApplyFilters={handleApplyAdvancedFilters}
      />
    </div>
  );
};

export default Dashboard;