import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { Link } from "wouter";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to access this page
          </p>
          <Link href="/login">
            <Button className="mixxl-gradient text-white">Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;
