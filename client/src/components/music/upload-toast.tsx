// UploadToast.tsx
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils"; // if you have a classnames helper

export function UploadToast({
  fileName,
  progress,
}: {
  fileName: string;
  progress: number;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Card
      className={cn(
        "glass-effect border-white/10 fixed right-10 bottom-10 overflow-hidden transition-all duration-300",
        collapsed ? "w-48" : "w-2/3 md:w-80"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between p-3">
        <CardTitle className="flex items-center text-sm font-medium">
          Uploading: {fileName}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          {collapsed ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <p className="px-3 pb-3 text-xs text-gray-400">
        Don't close the tab while uploading!
      </p>

      {collapsed ? (
        <div className="w-full px-3 pb-3">
          <Progress value={progress} className="h-1" />
        </div>
      ) : (
        <CardContent className="gap-2 flex items-center justify-center pb-3">
          <Progress value={progress} className="w-full h-1" />
          <span className="text-xs text-muted-foreground">{progress}%</span>
        </CardContent>
      )}
    </Card>
  );
}
