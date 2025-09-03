import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { AlertCircle, CheckCircle, Radio } from "lucide-react";

const UploadTips = () => {
  return (
    <Card className="glass-effect border-white/10">
      <CardHeader>
        <CardTitle className="text-lg">Upload Tips</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
          <p className="text-sm">
            Use high-quality audio files (WAV/FLAC preferred)
          </p>
        </div>
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
          <p className="text-sm">Add cover art for better discovery</p>
        </div>
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
          <p className="text-sm">Choose the right genre and mood</p>
        </div>
        <div className="flex items-start space-x-2">
          <Radio className="w-4 h-4 text-green-500 mt-0.5" />
          <p className="text-sm">
            Submit to radio playlist for airtime consideration
          </p>
        </div>
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
          <p className="text-sm">Make sure you own the rights to the music</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadTips;
