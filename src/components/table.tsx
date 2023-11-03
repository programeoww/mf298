import ExcelDownloader from "@/utils/excelDownloader"; 
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    ColumnDef,
    flexRender,
    FilterFn,
  } from "@tanstack/react-table";
  import { useEffect, useMemo, useState } from "react";

  function toLowerCaseNonAccentVietnamese(str: string) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
    str = str.replace(/\u02C6|\u0306|\u031B/g, "");
    return str;
}
  
  function Table({ data, columns, globalFilterEnable = false }: { data: Array<unknown>; columns: ColumnDef<any | unknown, any>[], globalFilterEnable?: boolean }) {
    const [globalFilter, setGlobalFilter] = useState('')
    const columnNames: string[] = Object.keys(data[0] ?? [])  

    const fuzzyFilter: FilterFn<any> = (row, columnId, value) => {
      const rowValue : string = row.getValue('name')
      const compareValue = toLowerCaseNonAccentVietnamese(rowValue)
      return compareValue.toLowerCase().includes(value.toLowerCase())
    }

    const table = useReactTable({
      data: useMemo(() => data, [data]),
      columns,
      state: {
        globalFilter,
      },
      onGlobalFilterChange: setGlobalFilter,
      globalFilterFn: fuzzyFilter,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
    });    

    return (
      <div className="space-y-3">
        <div className="flex space-x-2 justify-end">
          <button onClick={()=>ExcelDownloader(data, 'export', columnNames)} className="text-[#20744A] flex py-2 shrink-0 px-5 bg-[#20744A] bg-opacity-[0.11] rounded text-sm font-semibold hover:bg-opacity-30 duration-75 items-center ml-auto mr-2">
              <svg className={'text-[#20744A] mr-2'} width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M21.5858 3.30374H13.9882V1.51349L1.5 3.44099V20.3362L13.9882 22.4872V19.8337H21.5858C21.8158 19.8454 22.0412 19.7655 22.2125 19.6114C22.3839 19.4574 22.4872 19.2418 22.5 19.0117V4.12499C22.487 3.89509 22.3836 3.67966 22.2123 3.52578C22.041 3.37191 21.8157 3.29208 21.5858 3.30374ZM21.7057 19.1482H13.9628L13.95 17.7315H15.8153V16.0815H13.9357L13.9268 15.1065H15.8153V13.4565H13.9125L13.9035 12.4815H15.8153V10.8315H13.8975V9.85649H15.8153V8.20649H13.8975V7.23149H15.8153V5.58149H13.8975V4.08149H21.7057V19.1482Z" fill="currentColor" />
                  <path d="M16.8652 5.57925H20.1075V7.22925H16.8652V5.57925ZM16.8652 8.205H20.1075V9.855H16.8652V8.205ZM16.8652 10.8308H20.1075V12.4808H16.8652V10.8308ZM16.8652 13.4565H20.1075V15.1065H16.8652V13.4565ZM16.8652 16.0823H20.1075V17.7323H16.8652V16.0823Z" fill="currentColor" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M4.76025 8.00476L6.36975 7.91251L7.3815 10.6943L8.577 7.79776L10.1865 7.70551L8.232 11.655L10.1865 15.6143L8.48475 15.4995L7.33575 12.4815L6.186 15.3848L4.62225 15.2468L6.43875 11.7495L4.76025 8.00476Z" fill="white" />
              </svg>
              <span>Export excel</span>
          </button>
          {
            globalFilterEnable && (
              <input
                value={globalFilter ?? ''}
                onChange={e => setGlobalFilter(e.currentTarget.value)}
                className="p-2 text-sm shadow border rounded outline-none ml-auto block"
                placeholder="Tìm kiếm..."
              />
            )
          }
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="group">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2 border-b group-last:border-none text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {
              table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="text-center py-4 text-sm">Không có dữ liệu</td>
                </tr>
              )
            }
          </tbody>
        </table>
        <div className="flex items-center gap-2 mt-4 text-sm">
          <button
            className="border rounded p-1"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>
          <button
            className="border rounded p-1"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>
          <button
            className="border rounded p-1"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>
          <button
            className="border rounded p-1"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button>
          <span className="flex items-center gap-1">
            <div>Trang</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} /{" "}
              {table.getPageCount()}
            </strong>
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Hiển thị {pageSize} hàng
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }
  
  export default Table;
  