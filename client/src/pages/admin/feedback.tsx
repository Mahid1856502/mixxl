import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFeedbacks } from "@/api/hooks/admin/useFeedbacks";

const Feedback = () => {
  const { data: feedbackData = [] } = useFeedbacks();

  // Format dates consistently (e.g. "20 Sep 2025")
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Complaints & Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          {feedbackData.length > 0 ? (
            <Accordion type="multiple" className="w-full">
              {feedbackData.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="text-left">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            item.category === "complaint"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {item.category}
                        </Badge>
                        <span className="text-white font-medium">
                          {item.subject}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400 mt-1 md:mt-0">
                        {item.name} •{" "}
                        {item.createdAt
                          ? formatDate(new Date(item.createdAt).toISOString())
                          : ""}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="p-3 bg-gray-800 rounded-md text-gray-200">
                      {item.message}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-gray-400 text-center py-8">
              No feedback submitted yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Feedback;
