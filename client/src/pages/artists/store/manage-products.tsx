import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useUser } from "@/api/hooks/users/useUser";
import { useStoreByUser } from "@/api/hooks/store/useStore";
import {
  useProductsByStore,
  useDeleteProduct,
} from "@/api/hooks/products/useProducts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Edit, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmPopup";
import { Product, ProductVariantWithInventory } from "@shared/product.type";

const ManageProducts = () => {
  const { username } = useParams();
  const [, setLocation] = useLocation();

  const { data: currUser } = useUser(username);
  const { data: store } = useStoreByUser(currUser?.id);

  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading } = useProductsByStore(
    store?.id,
    page,
    PAGE_SIZE,
    debouncedSearch
  );

  const products = data?.products ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const deleteProduct = useDeleteProduct();

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct.mutateAsync(productId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header + Search */}
      <div className="mb-6">
        <div className="flex gap-2 w-full items-center justify-between">
          <h1 className="text-xl md:text-3xl font-bold">
            Manage Products ({data?.totalCount})
          </h1>
          <Button
            onClick={() => setLocation(`/store/${username}/mutate-product`)}
            className="flex items-center gap-2 text-xs md:text-base"
          >
            <Plus className="w-4 h-4" /> Create Product
          </Button>
        </div>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1); // reset to first page when search changes
          }}
          className="border px-4 py-2 mt-6 rounded-md w-full sm:w-64 bg-white/10 border-gray-300 text-sm"
        />
      </div>
      {isLoading || !store ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {[...Array(PAGE_SIZE)].map((_, i) => (
            <Skeleton key={i} className="h-60 w-full rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-gray-300">No products found.</p>
      ) : (
        <>
          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-gray-900 p-2 sm:p-4 rounded-xl shadow-md flex flex-col hover:shadow-xl transition-shadow"
              >
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full aspect-square object-cover rounded-md mb-4"
                  />
                )}
                <h2 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base md:text-lg lg:text-xl">
                  {product.title}
                </h2>
                <p className="text-gray-400 mb-4 line-clamp-2 text-xs sm:text-sm">
                  {product.description}
                </p>

                {product.variants?.length > 0 && (
                  <VariantList variants={product.variants} />
                )}

                <div className="flex gap-2 mt-auto">
                  {/* EDIT button */}
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() =>
                      setLocation(
                        `/store/${username}/mutate-product/${product.id}`
                      )
                    }
                  >
                    <Edit className="w-2 h-2 sm:w-4 sm:h-4" />

                    {/* label hidden on small screens */}
                    <span className="hidden sm:inline">Edit</span>
                  </Button>

                  {/* DELETE button */}
                  <Button
                    variant="destructive"
                    className="flex items-center gap-2"
                    onClick={() => {
                      setSelectedProduct(product);
                      setDeleteOpen(true);
                    }}
                    disabled={selectedProduct?.id === product.id}
                  >
                    <Trash2 className="w-2 h-2 sm:w-4 sm:h-4" />

                    {/* label hidden on small screens */}
                    <span className="hidden sm:inline">
                      {selectedProduct?.id === product.id
                        ? "Deleting..."
                        : "Delete"}
                    </span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-md border-gray-500 bg-white/10 flex items-center disabled:opacity-70"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              <span className="text-gray-300">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-md border-gray-500 bg-white/10 flex items-center disabled:opacity-70"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Album"
        description={
          <>
            Are you sure you want to delete the Album{" "}
            <strong>{selectedProduct?.title || "Untitled"}</strong>? This action
            cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          if (selectedProduct?.id) {
            try {
              await handleDelete(selectedProduct.id);
              setDeleteOpen(false);
              setSelectedProduct(null);
            } catch (err) {
              console.error("Delete failed:", err);
            }
          }
        }}
        isPending={deleteProduct?.isPending}
      />
    </div>
  );
};

export default ManageProducts;

const VariantList = ({
  variants,
}: {
  variants: ProductVariantWithInventory[];
}) => {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? variants : variants.slice(0, 2);
  const remainingCount = variants.length - 2;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {visible.map((v) => (
        <span
          key={v.id}
          className="bg-gray-700 text-white px-2 py-1 rounded text-xs"
        >
          {v.title} — ${(v.price / 100).toFixed(2)}
        </span>
      ))}

      {variants.length > 2 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="text-xs px-2 py-1 bg-gray-600 rounded hover:bg-gray-500"
        >
          +{remainingCount} more
        </button>
      )}
    </div>
  );
};
