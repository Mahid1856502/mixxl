import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { ArrowLeft, Save, Trash, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUploadFile } from "@/api/hooks/s3/useUploadFile";
import {
  useProduct,
  useUpdateProduct,
  useCreateProduct,
} from "@/api/hooks/products/useProducts";
import { useUser } from "@/api/hooks/users/useUser";
import { useStoreByUser } from "@/api/hooks/store/useStore";
import { VariantWithInventory } from "@shared/product.type";

// ------------------------- Zod schema -------------------------
const variantSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Variant title is required"),
  sku: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  stockQuantity: z.number().min(0, "Stock is required"),
});

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  images: z.array(z.string()).default([]),
  storeId: z.string().min(1, "Store is required"),
  published: z.boolean().default(true),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
});

type ProductForm = z.infer<typeof productSchema>;

type NewFile = {
  file: File;
  preview: string;
};

// ------------------------- Component -------------------------
const MutateProduct = () => {
  const { username, productId } = useParams<{
    username?: string;
    productId?: string;
  }>();
  const { data: user } = useUser(username);
  const { data: store } = useStoreByUser(user?.id);
  const { data: product } = useProduct(productId);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [, setLocation] = useLocation();
  const { uploadFile } = useUploadFile();

  const [newFiles, setNewFiles] = useState<NewFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  console.log("product", product);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      images: [],
      storeId: store?.id ?? "",
      published: true,
      variants: [
        {
          title: "",
          sku: "",
          price: "0",
          stockQuantity: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const existingImages = watch("images") ?? [];

  useEffect(() => {
    reset((prev) => ({ ...prev, storeId: store?.id ?? "" }));
  }, [store?.id, reset]);

  useEffect(() => {
    if (product) {
      reset({
        title: product.title ?? "",
        description: product.description ?? "",
        images: product.images ?? [],
        storeId: store?.id ?? "",
        published: product.published ?? true,
        variants: product.variants.map((v) => ({
          id: v.id,
          title: v.title,
          sku: v.sku || undefined,
          price: v.price,
          stockQuantity: v.stockQuantity ?? 0,
        })),
      });
    }
  }, [product, reset, store?.id]);

  useEffect(() => {
    return () => {
      newFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    };
  }, [newFiles]);

  const revokeAllPreviews = (files: NewFile[]) =>
    files.forEach((f) => URL.revokeObjectURL(f.preview));

  const handleImageDelete = (index: number) => {
    if (index < existingImages.length) {
      const updated = [...existingImages];
      updated.splice(index, 1);

      setValue("images", updated);
      setUploadError(null);
    } else {
      const newFileIndex = index - existingImages.length;
      const toRemove = newFiles[newFileIndex];
      if (toRemove) URL.revokeObjectURL(toRemove.preview);

      const updatedNewFiles = [...newFiles];
      updatedNewFiles.splice(newFileIndex, 1);
      setNewFiles(updatedNewFiles);

      if (existingImages.length + updatedNewFiles.length === 0) {
        setUploadError("At least one image is required.");
      }
    }
  };

  const onFilesAdded = (files: FileList | null) => {
    if (!files) return;
    const fileList: NewFile[] = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));

    setNewFiles((prev) => [...prev, ...fileList]);
  };

  const onSubmit = async (data: ProductForm) => {
    if (!store?.id) {
      setUploadError("Store is required.");
      return;
    }
    if (data.variants.length === 0) {
      setUploadError("At least one variant is required.");
      return;
    }

    if (data.images.length === 0 && newFiles.length === 0) {
      setUploadError("At least one image is required.");
      return;
    }

    setUploadError(null);

    setUploadError(null);

    // finalImages must have at least one item due to Zod validation
    const finalImages: string[] = [...data.images];

    try {
      const uploadedUrls = await Promise.all(
        newFiles.map((f) => uploadFile(f.file))
      );
      finalImages.push(...uploadedUrls);

      const payload = {
        ...data,
        images: finalImages,
        variants: data.variants as [
          VariantWithInventory,
          ...VariantWithInventory[]
        ],
      };
      console.log("Payload:", payload);
      if (productId && product) {
        updateProduct.mutate(
          { id: product.id, data: payload },
          {
            onSuccess: () => {
              revokeAllPreviews(newFiles);
              setNewFiles([]);
              if (username) setLocation(`/store/${username}/products`);
            },
            onError: (err: unknown) => {
              console.error("Update product failed", err);
              setUploadError("Failed to save product. Please try again.");
            },
          }
        );
      } else {
        createProduct.mutate(payload, {
          onSuccess: () => {
            revokeAllPreviews(newFiles);
            setNewFiles([]);
            if (username) setLocation(`/store/${username}/products`);
          },
          onError: (err: unknown) => {
            console.error("Create product failed", err);
          },
        });
      }
    } catch (err) {
      console.error("Upload failed", err);
      setUploadError("Failed to upload one or more images.");
    }
  };

  if (productId && !product) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-8 animate-fadeIn">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="w-full h-52 rounded-xl" />
      </div>
    );
  }

  const allImages = [...existingImages, ...newFiles.map((f) => f.preview)];
  console.log("errors", errors);
  return (
    <div className="max-w-3xl mx-auto p-6 animate-fadeIn space-y-10">
      <h1 className="text-3xl font-bold tracking-tight">
        {productId && product ? "Edit Product" : "Create Product"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* Images */}
        <div className="space-y-4">
          <label className="font-medium">Images</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allImages.map((img, i) => (
              <div
                key={`${img}-${i}`}
                className="relative group rounded-xl overflow-hidden border border-white/10"
              >
                <img
                  src={img}
                  alt={`product-${i}`}
                  className="w-full h-32 object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleImageDelete(i)}
                  className="absolute top-2 right-2 bg-black/50 p-1 rounded-md opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            <label className="border border-dashed border-white/20 rounded-xl flex items-center justify-center h-32 cursor-pointer hover:border-white/40 transition">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onFilesAdded(e.target.files)}
              />
              <span className="text-sm opacity-70">Add Images</span>
            </label>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <Input
            {...register("title")}
            placeholder="Product title"
            className="bg-white/5 border-white/10"
          />
          {errors.title && (
            <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <Textarea
            {...register("description")}
            placeholder="Describe the product..."
            className="bg-white/5 border-white/10 resize-none"
            rows={4}
          />
          {errors.description && (
            <p className="text-red-400 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Published toggle */}
        <div className="gap-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("published")}
              id="published"
              className="w-4 h-4"
            />
            <label htmlFor="published" className="font-medium">
              Publish
            </label>
          </div>
          <p className="text-sm text-gray-500 ">
            Uncheck this to save your product as draft. Checking <br />
            this will list the product on your store.
          </p>
        </div>

        {/* Variants */}
        <div className="space-y-4">
          <label className="font-medium">Variants</label>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-start border border-gray-700 rounded-xl p-4"
            >
              <div className="sm:col-span-2">
                <label className="block mb-1 text-sm">Title</label>
                <Input
                  {...register(`variants.${index}.title` as const)}
                  className="bg-white/5 border-white/10"
                />
                {errors.variants?.[index]?.title && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.variants[index]?.title?.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-1">
                <label className="block mb-1 text-sm">SKU</label>
                <Input
                  {...register(`variants.${index}.sku` as const)}
                  className="bg-white/5 border-white/10"
                />
                {errors.variants?.[index]?.sku && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.variants[index]?.sku?.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-1">
                <label className="block mb-1 text-sm">Price (£)</label>
                <Input
                  type="number"
                  step={"any"}
                  {...register(`variants.${index}.price` as const)}
                  className="bg-white/5 border-white/10"
                />
                {errors.variants?.[index]?.price && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.variants[index]?.price?.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-1">
                <label className="block mb-1 text-sm">Stock</label>
                <Input
                  type="number"
                  {...register(`variants.${index}.stockQuantity` as const, {
                    valueAsNumber: true,
                  })}
                  className="bg-white/5 border-white/10"
                />
                {errors.variants?.[index]?.stockQuantity && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.variants[index]?.stockQuantity?.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-1">
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full flex items-center justify-center mt-6"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2"
            onClick={() =>
              append({
                title: "",
                sku: "",
                price: "0",
                stockQuantity: 0,
              })
            }
          >
            <Plus className="w-4 h-4" /> Add Variant
          </Button>
        </div>
        {(uploadError || errors?.variants?.message) && (
          <div className="text-center w-full border border-red-700 p-3 rounded-md bg-red-950/20">
            <p className="text-white text-sm">
              {uploadError || errors?.variants?.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            disabled={
              updateProduct.isPending || createProduct.isPending || isSubmitting
            }
            onClick={() =>
              username && setLocation(`/store/${username}/products`)
            }
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
          </Button>

          <Button
            type="submit"
            disabled={
              updateProduct.isPending || createProduct.isPending || isSubmitting
            }
          >
            <Save className="w-4 h-4 mr-2" />
            {updateProduct.isPending || createProduct.isPending
              ? "Saving..."
              : productId
              ? "Save Changes"
              : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MutateProduct;
