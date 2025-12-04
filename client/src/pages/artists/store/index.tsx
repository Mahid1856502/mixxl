import React, { useState, useMemo } from "react";
import ProductCard from "@/components/artist/store/ProductCard";
import ArtistBanner from "@/components/artist/store/ArtistBanner";
import { useParams } from "wouter";

interface ProductCategory {
  label: string;
  value: string;
}

interface Product {
  image: string;
  title: string;
  price: string;
  description: string;
  category: ProductCategory;
}

const Store = () => {
  const { username } = useParams();
  console.log("Artist ID:", username);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const itemsPerPage = 8;

  const filters = [
    { label: "All", value: "all" },
    { label: "Cups", value: "cups" },
    { label: "T Shirts", value: "tshirts" },
    { label: "Hoodies", value: "hoodies" },
    { label: "CDs & Vinyl", value: "cdsvinyl" },
  ];

  const products: Product[] = [
    {
      image: "https://images.pexels.com/photos/734983/pexels-photo-734983.jpeg",
      title: "Ceramic Coffee Mug",
      price: "19.99",
      description:
        "A high-quality ceramic mug perfect for your morning coffee.",
      category: { label: "Cups", value: "cups" },
    },
    {
      image:
        "https://images.pexels.com/photos/2560894/pexels-photo-2560894.jpeg",
      title: "Graphic T-Shirt",
      price: "24.99",
      description: "Soft cotton T-shirt with a stylish graphic design.",
      category: { label: "T Shirts", value: "tshirts" },
    },
    {
      image:
        "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80",
      title: "Classic Hoodie",
      price: "49.99",
      description: "Warm and comfortable hoodie for everyday wear.",
      category: { label: "Hoodies", value: "hoodies" },
    },
    {
      image:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
      title: "Vinyl Record",
      price: "34.99",
      description:
        "Limited edition vinyl record for collectors and music lovers.",
      category: { label: "CDs & Vinyl", value: "cdsvinyl" },
    },
    {
      image:
        "https://images.pexels.com/photos/1001990/pexels-photo-1001990.jpeg",
      title: "Ceramic Tea Set",
      price: "59.99",
      description: "Elegant ceramic tea set for a perfect tea experience.",
      category: { label: "Cups", value: "cups" },
    },
    {
      image:
        "https://images.pexels.com/photos/3053824/pexels-photo-3053824.jpeg",
      title: "Hooded Sweatshirt",
      price: "39.99",
      description:
        "Comfortable hooded sweatshirt available in multiple colors.",
      category: { label: "Hoodies", value: "hoodies" },
    },
    {
      image: "https://images.pexels.com/photos/734983/pexels-photo-734983.jpeg",
      title: "Ceramic Coffee Mug",
      price: "19.99",
      description:
        "A high-quality ceramic mug perfect for your morning coffee.",
      category: { label: "Cups", value: "cups" },
    },
    {
      image:
        "https://images.pexels.com/photos/2560894/pexels-photo-2560894.jpeg",
      title: "Graphic T-Shirt",
      price: "24.99",
      description: "Soft cotton T-shirt with a stylish graphic design.",
      category: { label: "T Shirts", value: "tshirts" },
    },
    {
      image:
        "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80",
      title: "Classic Hoodie",
      price: "49.99",
      description: "Warm and comfortable hoodie for everyday wear.",
      category: { label: "Hoodies", value: "hoodies" },
    },
    {
      image:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
      title: "Vinyl Record",
      price: "34.99",
      description:
        "Limited edition vinyl record for collectors and music lovers.",
      category: { label: "CDs & Vinyl", value: "cdsvinyl" },
    },
    {
      image:
        "https://images.pexels.com/photos/1001990/pexels-photo-1001990.jpeg",
      title: "Ceramic Tea Set",
      price: "59.99",
      description: "Elegant ceramic tea set for a perfect tea experience.",
      category: { label: "Cups", value: "cups" },
    },
    {
      image:
        "https://images.pexels.com/photos/3053824/pexels-photo-3053824.jpeg",
      title: "Hooded Sweatshirt",
      price: "39.99",
      description:
        "Comfortable hooded sweatshirt available in multiple colors.",
      category: { label: "Hoodies", value: "hoodies" },
    },
  ];

  // ---------- FILTER & SEARCH ----------
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesFilter =
        selectedFilter === "all" || product.category.value === selectedFilter;

      const matchesSearch =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [selectedFilter, searchQuery, products]);

  // ---------- PAGINATION ----------
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="px-4 md:p-8 w-full">
      <ArtistBanner
        name="John Doe"
        bio="Independent artist blending modern beats with soulful melodies. Explore exclusive merch and music."
        banner="https://images.pexels.com/photos/6270274/pexels-photo-6270274.jpeg"
        links={{
          Instagram: "https://instagram.com",
          Spotify: "https://spotify.com",
          YouTube: "https://youtube.com",
        }}
      />

      {/* Filters + Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search products..."
          className="border px-4 py-2 rounded-md w-full md:w-64 bg-white/10 border-gray-300"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />

        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => (
            <button
              key={filter.value}
              className={`px-4 py-2 rounded-full text-sm border transition ${
                selectedFilter === filter.value
                  ? "bg-white/10 text-white"
                  : "bg-black text-white"
              }`}
              onClick={() => {
                setSelectedFilter(filter.value);
                setCurrentPage(1);
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
        <div className="col-span-1 md:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedProducts.map((product, idx) => (
            <ProductCard
              key={idx}
              image={product.image}
              title={product.title}
              price={product.price}
              description={product.description}
            />
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-4">
          <button
            className="px-4 py-2 border rounded-md border-gray-100 bg-white/10"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <span className="px-4 py-2 text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="px-4 py-2 border rounded-md border-gray-100 bg-white/10"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Store;
