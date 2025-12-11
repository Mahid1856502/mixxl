import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useUser } from "@/api/hooks/users/useUser";
import {
  useStoreByUser,
  useUpdateStore,
  useSetupStore,
} from "@/api/hooks/store/useStore";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save } from "lucide-react";
import CoverUploader from "@/components/music/cover-uploader";
import { useUploadFile } from "@/api/hooks/s3/useUploadFile";
import { UpdateStore, InsertStore } from "@shared/store.type";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Zod schema for both setup & update
const baseStoreSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  bannerImage: z.string().optional(),
});

const ManageStore = () => {
  const { username } = useParams();
  const { data: currUser } = useUser(username);
  const { data: store, isLoading: storeLoading } = useStoreByUser(currUser?.id);
  const updateStore = useUpdateStore();
  const setupStore = useSetupStore();
  const [, setLocation] = useLocation();
  const { uploadFile, isUploading, progress, fileName } = useUploadFile();

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateStore | InsertStore>({
    resolver: zodResolver(baseStoreSchema),
    defaultValues: {
      name: "",
      description: "",
      bannerImage: "",
    },
  });

  useEffect(() => {
    if (store) {
      reset({
        name: store.name,
        description: store.description ?? "",
        bannerImage: store.bannerImage ?? "",
      });
    }
  }, [store, reset]);

  const handleRemoveBanner = (file: File | null) => {
    if (!file) {
      setValue("bannerImage", "");
    }
    setCoverFile(file);
    setBannerError(null);
  };

  const onSubmit = async (data: UpdateStore | InsertStore) => {
    if (!coverFile && !data.bannerImage) {
      setBannerError("Banner image is required");
      return;
    }

    try {
      if (coverFile) {
        const uploadedUrl = await uploadFile(coverFile);
        data.bannerImage = uploadedUrl;
      }

      const payload = {
        ...data,
        name: data?.name || "",
        userId: currUser?.id!,
      };
      if (!store) {
        // Setup new store
        setupStore.mutate(payload, {
          onSuccess: () => setLocation(`/store/${username}`),
        });
        return;
      }

      // Update existing store
      updateStore.mutate(
        { id: store.id, data },
        {
          onSuccess: () => setLocation(`/store/${username}`),
        }
      );
    } catch (err) {
      console.error("Failed to upload banner image:", err);
    }
  };

  if (!store && storeLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-2">
          <Skeleton className="w-full h-52 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
        <div className="flex justify-end gap-4">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        {store ? "Manage Store" : "Setup Store"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="gap-8 mb-6">
          <CoverUploader
            title="Banner"
            coverUrl={store?.bannerImage || null}
            coverFile={coverFile}
            setCoverFile={handleRemoveBanner}
            progress={fileName === coverFile?.name ? progress : 0}
          />
          {(bannerError || errors.bannerImage) && (
            <p className="text-red-400 text-sm mt-2">
              {bannerError || errors.bannerImage?.message}
            </p>
          )}
        </div>

        <div className="gap-6 mb-8">
          <label className="block mb-1 font-medium">Title</label>
          <Input
            {...register("name")}
            placeholder="Enter title"
            className="bg-white/5 border-white/10"
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-2">{errors.name.message}</p>
          )}
        </div>

        <div className="mb-8">
          <label className="block mb-1 font-medium">Description</label>
          <Textarea
            {...register("description")}
            placeholder="Describe your store..."
            className="bg-white/5 border-white/10 resize-none"
            rows={3}
          />
          {errors.description && (
            <p className="text-red-400 text-sm mt-2">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-4">
          {store && (
            <Button
              variant="outline"
              disabled={updateStore.isPending || isSubmitting || isUploading}
              onClick={() => setLocation(`/store/${username}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            disabled={
              updateStore.isPending ||
              setupStore.isPending ||
              isSubmitting ||
              isUploading
            }
          >
            <Save className="w-4 h-4 mr-2" />
            {updateStore.isPending || setupStore.isPending
              ? "Saving..."
              : store
              ? "Save Changes"
              : "Create Store"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ManageStore;
