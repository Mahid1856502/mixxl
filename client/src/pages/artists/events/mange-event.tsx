import { useUploadFile } from "@/api/hooks/s3/useUploadFile";
import CoverUploader from "@/components/music/cover-uploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Plus, Trash2, Ticket } from "lucide-react";
import { Link, useParams } from "wouter";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";

/* ---------------- Types ---------------- */
type TicketTypeForm = {
  name: string;
  price: number;
  capacity: number;
  description?: string;
};

type ManageEventForm = {
  title: string;
  genre: string;
  description: string;
  dateTime: Date;
  venue: string;
  location: string;
  tickets: TicketTypeForm[];
};

const ManageEvent = () => {
  const { username } = useParams();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const { progress, fileName } = useUploadFile();

  /* ---------------- React Hook Form ---------------- */
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ManageEventForm>({
    defaultValues: {
      title: "",
      genre: "",
      description: "",
      dateTime: new Date(),
      venue: "",
      location: "",
      tickets: [
        {
          name: "General Admission",
          price: 0,
          capacity: 250,
          description: "Free entry for all fans",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tickets",
  });

  const onSubmit = (data: ManageEventForm) => {
    console.log("EVENT DATA:", data);
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
            coverUrl={null}
            coverFile={coverFile}
            setCoverFile={setCoverFile}
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
                  <Input
                    placeholder="Event Title"
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

                <Input placeholder="Genre" {...register("genre")} />
              </div>

              <div>
                <Textarea
                  rows={5}
                  placeholder="Describe your event..."
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
                name="dateTime"
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
              {errors.dateTime && (
                <p className="text-sm text-red-400">
                  {errors.dateTime.message}
                </p>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <Input
                    placeholder="Venue"
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
                  <Input
                    placeholder="City & Location"
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
                  append({
                    name: "",
                    price: 0,
                    capacity: 0,
                    description: "",
                  })
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
                        <Input
                          placeholder="Ticket Name"
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

                      <Input
                        type="number"
                        min={0}
                        placeholder="Price ($)"
                        {...register(`tickets.${index}.price`, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>

                    <div>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Capacity"
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

                    <Textarea
                      rows={3}
                      placeholder="Description / Perks"
                      {...register(`tickets.${index}.description`)}
                    />
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant={"outline"}>
              Save Draft
            </Button>

            <Button
              type="submit"
              className="flex items-center gap-2 font-medium"
            >
              <Save className="w-4 h-4" />
              Publish Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageEvent;
