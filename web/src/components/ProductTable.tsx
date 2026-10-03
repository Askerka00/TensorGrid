import React, { useState } from 'react';
import {
  Star,
  Plus,
  Tag,
  Edit3,
  Trash2,
  Minus,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Check,
} from 'lucide-react';
import type { Product, ProductStatus } from '../types';

interface ProductTableProps {
  products: Product[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onDeleteSelected: () => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onToggleSelect,
  onSelectAll,
  onDeleteSelected,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [goToPageInput, setGoToPageInput] = useState('');

  const selectedCount = products.filter((p) => p.selected).length;
  const allSelected = products.length > 0 && selectedCount === products.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < products.length;

  const handleSelectAllClick = () => {
    onSelectAll(!allSelected);
  };

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case 'In Stock':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#eef0ff] text-[#5b58ea]">
            In Stock
          </span>
        );
      case 'Out of Stock':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#fef0f1] text-[#f44e59]">
            Out of Stock
          </span>
        );
      case 'Restock':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#fef6e7] text-[#e59b24]">
            Restock
          </span>
        );
    }
  };

  return (
    <div className="px-6 py-2 pb-8">
      <div className="bg-white border border-gray-200/90 rounded-2xl shadow-2xs relative flex flex-col">
        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-white">
                <th className="py-3 px-4 w-12 text-center">
                  <div
                    onClick={handleSelectAllClick}
                    className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors mx-auto ${
                      allSelected || isIndeterminate
                        ? 'bg-[#ff6422] border-[#ff6422] text-white'
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                    }`}
                  >
                    {allSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    {isIndeterminate && <Minus className="w-3 h-3 stroke-[3]" />}
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Product</th>
                <th className="py-3 px-4 font-semibold">Price</th>
                <th className="py-3 px-4 font-semibold">Sales</th>
                <th className="py-3 px-4 font-semibold">Revenue</th>
                <th className="py-3 px-4 font-semibold">Stock</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Rating</th>
                <th className="py-3 px-4 w-10 text-center">
                  <button
                    title="Add Column"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100 text-xs">
              {products.map((product) => {
                const isSelected = !!product.selected;
                return (
                  <tr
                    key={product.id}
                    onClick={() => onToggleSelect(product.id)}
                    className={`transition-colors cursor-pointer relative group ${
                      isSelected
                        ? 'bg-[#fff7f2] hover:bg-[#fff3eb]'
                        : 'hover:bg-gray-50/80'
                    }`}
                  >
                    {/* Checkbox column with active border strip */}
                    <td className="py-3.5 px-4 text-center relative">
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff6422]" />
                      )}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSelect(product.id);
                        }}
                        className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors mx-auto ${
                          isSelected
                            ? 'bg-[#ff6422] border-[#ff6422] text-white'
                            : 'border-gray-300 group-hover:border-gray-400 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </td>

                    {/* Product Name */}
                    <td className="py-3.5 px-4 font-medium text-gray-900">
                      {product.name}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-medium text-gray-700">
                      ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    {/* Sales */}
                    <td className="py-3.5 px-4 text-gray-600">
                      {product.sales} pcs
                    </td>

                    {/* Revenue */}
                    <td className="py-3.5 px-4 font-medium text-gray-700">
                      ${product.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-4 text-gray-600">
                      {product.stock}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(product.status)}
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                        <span className="font-semibold text-gray-700">
                          {product.rating.toFixed(1)}
                        </span>
                      </div>
                    </td>

                    {/* Extra column spacer */}
                    <td className="py-3.5 px-4 text-center"></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add Column Button below rows */}
        <div className="px-4 py-2.5 border-t border-gray-100 flex items-center">
          <button className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Column</span>
          </button>
        </div>

        {/* Floating Action Pill Bar (Centered over bottom track) */}
        {selectedCount > 0 && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-12 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="bg-white/95 backdrop-blur-md border border-gray-200/90 shadow-xl rounded-2xl px-4 py-2 flex items-center gap-3.5 text-xs text-gray-700">
              <span className="font-bold text-gray-900 whitespace-nowrap">
                {selectedCount} Selected
              </span>

              <div className="w-[1px] h-4 bg-gray-200" />

              <button className="flex items-center gap-1.5 font-medium hover:text-gray-950 transition-colors">
                <Tag className="w-3.5 h-3.5 text-gray-500" />
                <span>Apply Code</span>
              </button>

              <button className="flex items-center gap-1.5 font-medium hover:text-gray-950 transition-colors">
                <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                <span>Edit Info</span>
              </button>

              <button
                onClick={onDeleteSelected}
                className="flex items-center gap-1.5 font-medium hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-600" />
                <span>Delete</span>
              </button>

              <div className="w-[1px] h-4 bg-gray-200" />

              <button
                title="Minimize"
                className="text-gray-400 hover:text-gray-600 p-0.5"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onSelectAll(false)}
                title="Deselect All"
                className="text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="px-6 py-3.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Showing per page */}
          <div className="flex items-center gap-2 text-gray-500">
            <span>Showing per page</span>
            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="appearance-none bg-white border border-gray-200/90 rounded-lg px-2.5 py-1 pr-6 font-semibold text-gray-800 outline-none cursor-pointer hover:border-gray-300"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>

          {/* Page numbers */}
          <div className="flex items-center gap-1 text-gray-600">
            <button
              onClick={() => setCurrentPage(1)}
              title="First Page"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              title="Previous Page"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setCurrentPage(1)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-all ${
                currentPage === 1
                  ? 'bg-[#ff6422] text-white shadow-2xs'
                  : 'hover:bg-gray-100'
              }`}
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-medium transition-all ${
                currentPage === 2
                  ? 'bg-[#ff6422] text-white shadow-2xs'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              2
            </button>
            <button
              onClick={() => setCurrentPage(3)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-medium transition-all ${
                currentPage === 3
                  ? 'bg-[#ff6422] text-white shadow-2xs'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              3
            </button>

            <span className="px-1 text-gray-400 select-none">...</span>

            <button
              onClick={() => setCurrentPage(25)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-medium transition-all ${
                currentPage === 25
                  ? 'bg-[#ff6422] text-white shadow-2xs'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              25
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(25, p + 1))}
              title="Next Page"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(25)}
              title="Last Page"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Go to page */}
          <div className="flex items-center gap-1.5 text-gray-500">
            <span>Go to page</span>
            <input
              type="text"
              value={goToPageInput}
              onChange={(e) => setGoToPageInput(e.target.value)}
              placeholder="1"
              className="w-10 h-7 text-center border border-gray-200/90 rounded-lg outline-none font-medium text-gray-800 focus:border-gray-400"
            />
            <button
              onClick={() => {
                const p = parseInt(goToPageInput);
                if (p >= 1 && p <= 25) setCurrentPage(p);
              }}
              className="flex items-center gap-0.5 px-2.5 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200/90 rounded-lg font-semibold text-gray-700 transition-colors"
            >
              <span>Go</span>
              <ChevronRight className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
