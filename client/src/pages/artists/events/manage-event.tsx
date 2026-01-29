import { useUploadFile } from "@/api/hooks/s3/useUploadFile";
import CoverUploader from "@/components/music/cover-uploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Plus, Trash2, Ticket, Loader2 } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateEvent } from "@shared/schema";
import {
  useCreateEvent,
  useGetEventById,
  useUpdateEvent,
} from "@/api/hooks/events/useEvent";
import { numbersOnly } from "@/lib/helper";
import { GENRES } from "@/lib/constants";
import { MultiSelect } from "@/components/ui/multi-select";

const ManageEvent = () => {
  const { username, eventId } = useParams();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [, navigate] = useLocation();
  const { uploadFile, isUploading, progress, fileName } = useUploadFile();
  const { mutate: createEvent, isPending: isCreatingEvent } = useCreateEvent();
  const { mutate: updateEvent, isPending: isUpdatingEvent } = useUpdateEvent();
  const { data: eventToEdit } = useGetEventById(eventId); // New line to fetch event data for editing

  /* ---------------- React Hook Form ---------------- */
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateEvent>({
    defaultValues: {
      title: "",
      genre: [],
      description: "",
      startDateTime: new Date(),
      venue: "",
      coverImageUrl: "",
      location: "",
      tickets: [
        {
          name: "General Admission",
          price: "0",
          capacity: 250,
          description: "Free entry for all fans",
        },
      ],
    },
  });

  const handleRemoveBanner = (file: File | null) => {
    if (!file) {
      setValue("coverImageUrl", "");
    }
    setCoverFile(file);
  };

  useEffect(() => {
    if (!eventToEdit) return;

    reset({
      title: eventToEdit.title,
      genre: eventToEdit.genre ?? [],
      description: eventToEdit.description,
      startDateTime: new Date(eventToEdit.startDateTime),
      venue: eventToEdit.venue,
      location: eventToEdit.location,
      coverImageUrl: eventToEdit.coverImageUrl || undefined,
      tickets:
        eventToEdit.tickets?.length > 0
          ? eventToEdit.tickets.map((ticket) => ({
              name: ticket.name,
              price: ticket.price,
              capacity: ticket.capacity,
              description: ticket.description ?? "",
            }))
          : [
              {
                name: "General Admission",
                price: "0",
                capacity: 250,
                description: "",
              },
            ],
    });
  }, [eventToEdit, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tickets",
  });

  const onSubmit = async (data: CreateEvent) => {
    if (coverFile) {
      const uploadedUrl = await uploadFile(coverFile);
      data.coverImageUrl = uploadedUrl;
    }

    const payload: CreateEvent = {
      ...data,
      startDateTime: new Date(data.startDateTime),
      tickets: data.tickets,
    };

    if (eventToEdit) {
      // Update existing event
      updateEvent(
        { eventId: eventToEdit.id, data: payload },
        {
          onSuccess: () => navigate(`/events/${username}`),
        }
      );
      return;
    }
    createEvent(payload, {
      onSuccess: () => navigate(`/events/${username}`),
    });
  };

  const errorClass = "border-red-500 focus-visible:ring-red-500";

  return (
    <div className="min-h-screen text-white px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Back */}
        <Link
          href={`/events/${username}`}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>

        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-4xl font-bold mixxl-gradient-text">
            Create New Event
          </h1>
          <p className="text-neutral-400 max-w-2xl">
            Host a live show, radio session, or community gathering on Mixxl.
            Configure event details and ticket options below.
          </p>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Cover */}
          <CoverUploader
            coverUrl={eventToEdit?.coverImageUrl || null}
            coverFile={coverFile}
            setCoverFile={handleRemoveBanner}
            title="Event Cover Image"
            progress={fileName === coverFile?.name ? progress : 0}
          />

          {/* Basic Info */}
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="title"
                    className="block mb-1 text-sm font-medium"
                  >
                    Event Title
                  </label>
                  <Input
                    id="title"
                    placeholder="Enter a catchy title for your event"
                    {...register("title", {
                      required: "Event title is required",
                    })}
                    className={errors.title ? errorClass : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-400 mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  {/* <Input
                    id="genre"
                    placeholder="E.g., Rock, Jazz, Podcast, Workshop"
                    {...register("genre")}
                  /> */}
                  <Controller
                    control={control}
                    name="genre"
                    render={({ field }) => (
                      <div>
                        <label
                          htmlFor="genre"
                          className="block mb-1 text-sm font-medium"
                        >
                          Genre
                        </label>
                        <MultiSelect
                          options={GENRES.map((genre) => ({
                            label: genre,
                            value: genre,
                          }))}
                          value={field.value || []} // controlled value
                          onValueChange={(val: string[]) => field.onChange(val)}
                          placeholder="Select genres..."
                        />
                        {errors.genre && (
                          <p className="text-sm text-red-400 mt-1">
                            {errors.genre.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block mb-1 text-sm font-medium"
                >
                  Description
                </label>
                <Textarea
                  id="description"
                  rows={5}
                  placeholder="Give a detailed description to attract attendees"
                  {...register("description", {
                    required: "Event description is required",
                  })}
                  className={errors.description ? errorClass : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-400 mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Date & Location */}
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle>Date & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Controller
                name="startDateTime"
                control={control}
                rules={{ required: "Date & time is required" }}
                render={({ field }) => (
                  <DateTimePicker
                    label="Date & Time"
                    showTimePicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.startDateTime && (
                <p className="text-sm text-red-400">
                  {errors.startDateTime.message}
                </p>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="venue"
                    className="block mb-1 text-sm font-medium"
                  >
                    Venue
                  </label>
                  <Input
                    id="venue"
                    placeholder="E.g., Madison Square Garden, London Hall"
                    {...register("venue", { required: "Venue is required" })}
                    className={errors.venue ? errorClass : ""}
                  />
                  {errors.venue && (
                    <p className="text-sm text-red-400 mt-1">
                      {errors.venue.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block mb-1 text-sm font-medium"
                  >
                    City & Location
                  </label>
                  <Input
                    id="location"
                    placeholder="City and specific location (street/area)"
                    {...register("location", {
                      required: "Location is required",
                    })}
                    className={errors.location ? errorClass : ""}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-400 mt-1">
                      {errors.location.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Types */}
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                Ticket Types
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({ name: "", price: "0", capacity: 0, description: "" })
                }
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Ticket Type
              </Button>

              {fields.map((field, index) => (
                <Card
                  key={field.id}
                  className="border-2 border-neutral-800 shadow-md shadow-purple-950/50"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Ticket Type</span>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-neutral-500 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block mb-1 text-sm font-medium">
                          Ticket Name
                        </label>
                        <Input
                          placeholder="E.g., VIP, General Admission, Early Bird"
                          {...register(`tickets.${index}.name`, {
                            required: "Ticket name is required",
                          })}
                          className={
                            errors.tickets?.[index]?.name ? errorClass : ""
                          }
                        />
                        {errors.tickets?.[index]?.name && (
                          <p className="text-sm text-red-400 mt-1">
                            {errors.tickets[index]?.name?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium">
                          Price (£)
                        </label>
                        <Controller
                          control={control}
                          name={`tickets.${index}.price`}
                          render={({ field }) => (
                            <Input
                              type="text"
                              placeholder="Set ticket price in GBP"
                              {...field}
                              onChange={(e) =>
                                field.onChange(numbersOnly(e.target.value))
                              }
                            />
                          )}
                        />
                        {errors.tickets?.[index]?.price && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.tickets[index]?.price?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Capacity
                      </label>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Maximum number of attendees"
                        {...register(`tickets.${index}.capacity`, {
                          required: "Capacity is required",
                          valueAsNumber: true,
                        })}
                        className={
                          errors.tickets?.[index]?.capacity ? errorClass : ""
                        }
                      />
                      {errors.tickets?.[index]?.capacity && (
                        <p className="text-sm text-red-400 mt-1">
                          {errors.tickets[index]?.capacity?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Description / Perks
                      </label>
                      <Textarea
                        rows={3}
                        placeholder="List perks, benefits, or details for this ticket type"
                        {...register(`tickets.${index}.description`)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              onClick={() => navigate(`/events/${username}`)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isUploading || isCreatingEvent || isUpdatingEvent}
              className={`flex items-center gap-2 font-medium ${
                isUploading || isCreatingEvent || isUpdatingEvent
                  ? "opacity-70"
                  : ""
              }`}
            >
              {isCreatingEvent || isUpdatingEvent ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {eventToEdit ? "Update Event" : "Publish Event"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageEvent;
