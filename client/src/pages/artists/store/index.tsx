import React, { useState, useEffect } from "react";
import ProductCard from "@/components/artist/store/ProductCard";
import ArtistBanner from "@/components/artist/store/ArtistBanner";

import { useParams, useLocation } from "wouter";
import { useAuth } from "@/provider/use-auth";
import { useStoreByUser } from "@/api/hooks/store/useStore";
import { useProductsByStore } from "@/api/hooks/products/useProducts";
import { useUser } from "@/api/hooks/users/useUser";
import ArtistBannerSkeleton from "@/components/artist/store/ArtistBannerSkeleton";
import ProductCardSkeleton from "@/components/artist/store/ProductCardSkeleton";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Store = () => {
  const { username } = useParams();
  const [, navigate] = useLocation();

  // Logged-in user (viewer)
  const { user } = useAuth();
  const { data: currUser, isLoading: currUserLoading } = useUser(username);

  const { data: store, isLoading: storeLoading } = useStoreByUser(currUser?.id);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data: productsData,
    isLoading: productsLoading,
    isFetching: productsFetching,
  } = useProductsByStore(store?.id, currentPage, itemsPerPage, debouncedSearch);

  const isOwnProfile = user?.id === currUser?.id;

  // ---------------------- No Store -----------------------
  if (!storeLoading && !store && !currUserLoading) {
    return (
      <div className="w-full px-6 py-16 flex flex-col items-center text-center">
        <h2 className="text-3xl font-semibold mb-4">
          Store hasn’t created yet.
        </h2>

        {isOwnProfile ? (
          <>
            <p className="text-gray-300 max-w-md mb-6">
              You haven’t set up your store yet. Create your store to start
              selling merch, music, and more.
            </p>
            <Button
              onClick={() => navigate(`/store/${username}/manage`)}
              className="bg-gray-950 text-gray-200 hover:bg-gray-900/50 border-2 border-gray-500 transition"
            >
              Setup Your Store
            </Button>
          </>
        ) : (
          <p className="text-gray-400">
            Check back later—this creator’s shop is coming soon!
          </p>
        )}
      </div>
    );
  }

  const totalPages = productsData?.limit
    ? Math.ceil((productsData?.totalCount || 0) / productsData.limit)
    : 1;

  return (
    <div className="px-4 md:p-8 w-full">
      {storeLoading || currUserLoading ? (
        <ArtistBannerSkeleton />
      ) : (
        <ArtistBanner
          name={store?.name ?? ""}
          bio={store?.description ?? ""}
          banner={store?.bannerImage ?? ""}
          isOwnProfile={isOwnProfile}
          links={{
            Instagram: "#",
            YouTube: "#",
            Spotify: "#",
          }}
        />
      )}

      {/* Filters + Search */}
      <div className="flex flex-row justify-between items-center mb-8 gap-4">
        <input
          type="text"
          placeholder="Search products..."
          className="border px-4 py-2 rounded-md w-72 bg-white/10 border-gray-300 text-sm md:text-base"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
        {productsLoading ||
        productsFetching ||
        storeLoading ||
        currUserLoading ? (
          Array.from({ length: itemsPerPage }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))
        ) : productsData?.products.length ? (
          productsData.products.map((product) => {
            return (
              <ProductCard
                defaultVariant={product?.variants?.[0]}
                product={product}
              />
            );
          })
        ) : isOwnProfile ? (
          <div className="col-span-full flex flex-col items-center mt-4">
            <p className="mb-4 text-center text-gray-300">
              You don't have any product added yet.
            </p>
            <Button
              onClick={() => navigate(`/store/${username}/mutate-product`)}
              className="flex items-center gap-2 bg-gray-950 text-gray-200 hover:bg-gray-900/50 border-2 border-gray-500 transition"
            >
              <Plus className="w-4 h-4" />
              Add Your First Product
            </Button>
          </div>
        ) : (
          <div className="col-span-full flex flex-col items-center mt-4">
            <p className="mb-4 text-center text-gray-300">
              {currUser?.fullName} don't have any product added yet.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-4">
          <button
            className="px-4 py-2 border rounded-md border-gray-500 bg-white/10 flex items-center disabled:opacity-70"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </button>

          <span className="px-4 py-2 text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="px-4 py-2 border rounded-md border-gray-500 bg-white/10 flex items-center disabled:opacity-70"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Store;
