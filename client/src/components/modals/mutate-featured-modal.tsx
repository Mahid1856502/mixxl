import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { InsertFeaturedSpot, insertFeaturedSpotSchema } from "@shared/schema";
import { DatePicker } from "../common/DatePicker";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useAllArtists } from "@/api/hooks/users/useArtists";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { numbersOnly } from "@/lib/helper";
import { useCreateFeaturedSpot } from "@/api/hooks/featured-spot/useMutationFeaturedSpot";

interface AddFeaturedSpotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFeaturedSpotModal({
  open,
  onOpenChange,
}: AddFeaturedSpotModalProps) {
  const { mutate: createFeaturedSpot, isPending } = useCreateFeaturedSpot();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<InsertFeaturedSpot>({
    resolver: zodResolver(insertFeaturedSpotSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      videoUrl: "",
      buttonText: "Visit Profile",
      buttonUrl: "",
      sortOrder: 0,
      artistId: "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      priceUSD: "0",
      stripePaymentIntentId: "",
    },
  });

  const { data: artists, isLoading } = useAllArtists();

  console.log("artists", artists);
  function onSubmit(data: InsertFeaturedSpot) {
    createFeaturedSpot({
      ...data,
      status: "active",
    } as InsertFeaturedSpot & { status: "active" });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Add Featured Spot
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Add the carousel slide details below
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-x-6 gap-y-4 max-w-full"
        >
          <div className="flex flex-col space-y-3 col-span-2">
            <Controller
              name="artistId"
              control={control}
              rules={{ required: "Artist is required" }}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white w-full">
                    <SelectValue
                      placeholder={
                        isLoading ? "Loading artists..." : "Select an artist"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 text-white max-h-60 overflow-auto">
                    <SelectGroup>
                      {artists?.map((artist) => (
                        <SelectItem key={artist.id} value={artist.id}>
                          {artist.username}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.artistId && (
              <p className="text-red-600 text-sm">{errors.artistId.message}</p>
            )}
          </div>
          {/* Title */}
          <div className="flex flex-col space-y-3">
            <Label htmlFor="title">Title</Label>
            <Input
              className="bg-gray-800 border-gray-600 text-white"
              id="title"
              type="text"
              {...register("title")}
              aria-invalid={errors.title ? "true" : "false"}
              placeholder="Featured spot title"
            />
            {errors.title && (
              <p className="text-red-600 text-sm">{errors.title.message}</p>
            )}
          </div>

          {/* Price USD */}
          <div className="flex flex-col space-y-3">
            <Controller
              control={control}
              name={"priceUSD"}
              render={({ field }) => (
                <>
                  <Label htmlFor="priceUSD">Price (USD)</Label>
                  <Input
                    className="bg-gray-800 border-gray-600 text-white"
                    id="priceUSD"
                    type="text"
                    {...field}
                    placeholder="Price in USD"
                    onChange={(e) =>
                      field.onChange(numbersOnly(e.target.value))
                    }
                  />
                  {errors.priceUSD && (
                    <p className="text-red-600 text-sm">
                      {errors.priceUSD.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Description - full width */}
          <div className="flex flex-col col-span-2 space-y-3">
            <Label htmlFor="description">Description</Label>
            <Textarea
              className="bg-gray-800 border-gray-600 text-white"
              id="description"
              {...register("description")}
              placeholder="Optional description"
              rows={4}
            />
            {errors.description && (
              <p className="text-red-600 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Image URL */}
          <div className="flex flex-col space-y-3">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              className="bg-gray-800 border-gray-600 text-white"
              id="imageUrl"
              type="url"
              {...register("imageUrl")}
              placeholder="Paste image URL here"
            />
            {errors.imageUrl && (
              <p className="text-red-600 text-sm">{errors.imageUrl.message}</p>
            )}
          </div>

          {/* Video URL */}
          <div className="flex flex-col space-y-3">
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input
              className="bg-gray-800 border-gray-600 text-white"
              id="videoUrl"
              type="url"
              {...register("videoUrl")}
              placeholder="Paste video URL here"
            />
            {errors.videoUrl && (
              <p className="text-red-600 text-sm">{errors.videoUrl.message}</p>
            )}
          </div>

          {/* Button Text */}
          <div className="flex flex-col space-y-3">
            <Label htmlFor="buttonText">Button Text</Label>
            <Input
              className="bg-gray-800 border-gray-600 text-white"
              id="buttonText"
              type="text"
              {...register("buttonText")}
              placeholder="Visit Profile"
            />
            {errors.buttonText && (
              <p className="text-red-600 text-sm">
                {errors.buttonText.message}
              </p>
            )}
          </div>

          {/* Button URL */}
          <div className="flex flex-col space-y-3">
            <Label htmlFor="buttonUrl">Button URL</Label>
            <Input
              className="bg-gray-800 border-gray-600 text-white"
              id="buttonUrl"
              // type="url"
              {...register("buttonUrl")}
              placeholder="URL for button"
            />
            {errors.buttonUrl && (
              <p className="text-red-600 text-sm">{errors.buttonUrl.message}</p>
            )}
          </div>

          {/* Start Date */}
          <div className="flex flex-col space-y-3">
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <DatePicker
                  id="startDate"
                  label="Start Date"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.startDate?.message}
                />
              )}
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col space-y-3">
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <DatePicker
                  id="endDate"
                  label="End Date"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.endDate?.message}
                />
              )}
            />
          </div>

          {/* Submit button spans full width */}
          <div className="col-span-2 flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Featured Spot"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
