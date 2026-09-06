'use client';
import { useState } from 'react';

export default function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState('Description');
  const specifications = product.specifications || product.specs || {};
  const entries = Object.entries(specifications);

  const tabs = ['Description', 'Specifications', 'Reviews', 'Shipping'];

  return (
    <div className="mt-6 bg-white rounded-[20px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="border-b border-slate-100 px-6 flex gap-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-4 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-all
              ${activeTab === tab ? 'border-blue-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8 min-h-[200px]">
        {activeTab === 'Description' && (
          <div className="prose prose-slate max-w-none">
            <p className="text-[14px] leading-relaxed text-slate-600 whitespace-pre-line">
              {product.description || 'No description available.'}
            </p>
          </div>
        )}

        {activeTab === 'Specifications' && (
          <div>
            {entries.length > 0 ? (
              <>
                <h3 className="text-[13px] font-semibold text-slate-800 mb-3">Technical Specifications</h3>
                <dl className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {entries.map(([key, value]) => (
                    <div key={key} className="grid grid-cols-2 gap-3 px-4 py-3 text-[13px] hover:bg-slate-50 transition">
                      <dt className="font-medium text-slate-500 capitalize">{key.replace(/_/g, ' ')}</dt>
                      <dd className="text-slate-800 font-medium break-words">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <p className="text-[14px] text-slate-500">No specifications available for this product.</p>
            )}
          </div>
        )}

        {activeTab === 'Reviews' && (
          <div className="text-[14px] text-slate-600">
            <p>Scroll down to Customer Reviews section or click below</p>
            <button 
              onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Go to Reviews
            </button>
          </div>
        )}

        {activeTab === 'Shipping' && (
          <div className="space-y-3 text-[14px] text-slate-600">
            <div className="flex gap-3"><span>🚚</span><div><strong>Island-wide Delivery</strong> - 2-4 working days across Sri Lanka</div></div>
            <div className="flex gap-3"><span>📦</span><div><strong>Free Delivery</strong> - On orders over Rs. 25,000</div></div>
            <div className="flex gap-3"><span>🛡</span><div><strong>Warranty</strong> - 1 Year warranty for genuine products</div></div>
            <div className="flex gap-3"><span>↩️</span><div><strong>Returns</strong> - 7 days return policy</div></div>
          </div>
        )}
      </div>
    </div>
  );
}
