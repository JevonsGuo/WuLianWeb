'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, FileText, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/lib/types';

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, open, onClose }: ProductModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return null;

  const images = product.image_urls || [];
  const hasMultipleImages = images.length > 1;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  // Reset image index when product changes
  const handleOpenChange = (v: boolean) => {
    if (!v) {
      onClose();
      setCurrentImageIndex(0);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden focus:outline-none">
          {/* Close button */}
          <Dialog.Close className="absolute right-4 top-4 z-10 p-1 rounded-full bg-white/80 hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </Dialog.Close>

          <div className="overflow-y-auto max-h-[85vh]">
            {/* Product Image Carousel */}
            <div className="w-full aspect-video bg-gray-100 relative group">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImageIndex]}
                    alt={`${product.name} - 图片 ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                  {/* Left/Right navigation arrows */}
                  {hasMultipleImages && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft size={20} className="text-gray-700" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight size={20} className="text-gray-700" />
                      </button>
                      {/* Dot indicators */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              idx === currentImageIndex
                                ? 'bg-white w-5'
                                : 'bg-white/60 hover:bg-white/80'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                  <span className="text-blue-300 text-6xl font-bold">
                    {product.name[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail strip for multiple images */}
            {hasMultipleImages && (
              <div className="flex gap-2 px-6 pt-4 overflow-x-auto">
                {images.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex
                        ? 'border-blue-500 shadow-sm'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`缩略图 ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

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
