'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X, FileText, Award } from 'lucide-react';
import { Product } from '@/lib/types';

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, open, onClose }: ProductModalProps) {
  if (!product) return null;

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden focus:outline-none">
          {/* Close button */}
          <Dialog.Close className="absolute right-4 top-4 z-10 p-1 rounded-full bg-white/80 hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </Dialog.Close>

          <div className="overflow-y-auto max-h-[85vh]">
            {/* Product Image */}
            <div className="w-full aspect-video bg-gray-100">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                  <span className="text-blue-300 text-6xl font-bold">
                    {product.name[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-6 md:p-8">
              <Dialog.Title className="text-2xl font-bold text-gray-900">
                {product.name}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-blue-600 font-medium mt-1">
                型号：{product.model}
              </Dialog.Description>

              {product.description && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    产品介绍
                  </h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Download Buttons */}
              <div className="mt-8 flex flex-wrap gap-3">
                {product.manual_url && (
                  <a
                    href={product.manual_url}
                    download
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <FileText size={16} />
                    <span>产品手册</span>
                  </a>
                )}
                {product.certificate_url && (
                  <a
                    href={product.certificate_url}
                    download
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    <Award size={16} />
                    <span>证书下载</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
