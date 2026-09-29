function Add-MobileFilter ($file, $date1, $date2, $date1Set, $date2Set) {
    $content = Get-Content $file -Raw
    
    # Check if we already have it
    if ($content -match "isFilterOpen") { return }
    
    # 1. Add state variable
    $content = $content -replace 'const \[fromDate, setFromDate\] = useState', "const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [fromDate, setFromDate] = useState"
    $content = $content -replace 'const \[startDate, setStartDate\] = useState', "const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [startDate, setStartDate] = useState"
    
    # 2. Build the Mobile Quick Bar HTML
    $quickBar = "<div className="md:hidden flex items-center justify-between gap-2 mb-2">
      <div className="flex gap-2 flex-1">
        <input type="date" value={$date1} onChange={(e) => $date1Set(e.target.value)} className="w-1/2 px-2 py-1.5 border border-[#CBD5E1] rounded text-[12px] font-bold text-black" />
        <input type="date" value={$date2} onChange={(e) => $date2Set(e.target.value)} className="w-1/2 px-2 py-1.5 border border-[#CBD5E1] rounded text-[12px] font-bold text-black" />
      </div>
      <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-1 bg-[#1E3A8A] text-white px-3 py-1.5 rounded text-[12px] font-bold shrink-0">
        <i className="fa fa-filter"></i> Filter
      </button>
    </div>"

    # 3. Add to JSX just before {/* Filter Section */}
    $content = $content -replace '\{/\* Filter Section \*/\}', "$quickBar

      {/* Filter Section */}"

    # 4. Modify the wrapper div
    $wrapperOld = '<div className="bg-white border border-[#E2E8F0] shadow-sm rounded-md mb-2 p-2 sm:p-3 sm:mb-3 shrink-0">'
    $wrapperNew = "<div className={"bg-white border border-[#E2E8F0] shadow-sm rounded-md mb-2 p-2 sm:p-3 sm:mb-3 shrink-0 ${isFilterOpen ? 'fixed inset-0 z-[100] m-0 rounded-none overflow-y-auto block' : 'hidden md:block'}"}>
        {isFilterOpen && (
          <div className="flex justify-between items-center pb-3 border-b border-[#E2E8F0] mb-3 md:hidden">
            <h3 className="font-bold text-[15px] text-[#1E3A8A]">Filter Reports</h3>
            <button onClick={() => setIsFilterOpen(false)} className="p-1.5 bg-red-50 text-red-600 rounded-full"><i className="fa fa-times"></i></button>
          </div>
        )}"
    $content = $content.Replace($wrapperOld, $wrapperNew)

    # 5. Handle SalesReport custom wrapper
    $salesOld = '<div className="bg-white border border-[#E2E8F0] shadow-sm rounded-md mb-2 p-3">'
    $salesNew = "<div className={"bg-white border border-[#E2E8F0] shadow-sm rounded-md mb-2 p-3 shrink-0 ${isFilterOpen ? 'fixed inset-0 z-[100] m-0 rounded-none overflow-y-auto block' : 'hidden md:block'}"}>
        {isFilterOpen && (
          <div className="flex justify-between items-center pb-3 border-b border-[#E2E8F0] mb-3 md:hidden">
            <h3 className="font-bold text-[15px] text-[#1E3A8A]">Filter Reports</h3>
            <button onClick={() => setIsFilterOpen(false)} className="p-1.5 bg-red-50 text-red-600 rounded-full"><i className="fa fa-times"></i></button>
          </div>
        )}"
    $content = $content.Replace($salesOld, $salesNew)
    
    Set-Content $file $content
}

Add-MobileFilter "frontend/src/pages/reports/PurchaseReport.tsx" "fromDate" "toDate" "setFromDate" "setToDate"
Add-MobileFilter "frontend/src/pages/reports/SalesReport.tsx" "fromDate" "toDate" "setFromDate" "setToDate"
Add-MobileFilter "frontend/src/pages/reports/CustomerReceiptsReport.tsx" "startDate" "endDate" "setStartDate" "setEndDate"
Add-MobileFilter "frontend/src/pages/reports/SupplierPaymentsReport.tsx" "startDate" "endDate" "setStartDate" "setEndDate"
