"use client";

import Link from "next/link";
import { Compass, Home, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A1A12] p-4">
      <Card className="max-w-md w-full p-8 bg-[#1A2A22] border-[#2A3A32]">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* 404 Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
            <Compass className="h-8 w-8 text-amber-500" />
          </div>

          {/* 404 Message */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">404</h1>
            <h2 className="text-xl font-semibold text-gray-300">
              Page not found
            </h2>
            <p className="text-gray-400 text-sm">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved to a different location.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button asChild variant="default" className="flex-1">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="flex-1"
            >
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              Go Back
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="text-sm text-gray-500 space-y-2">
            <p>Looking for something specific?</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link
                href="/tours"
                className="text-amber-500 hover:text-amber-400 underline"
              >
                Tours
              </Link>
              <span>•</span>
              <Link
                href="/lodges"
                className="text-amber-500 hover:text-amber-400 underline"
              >
                Lodges
              </Link>
              <span>•</span>
              <Link
                href="/journal"
                className="text-amber-500 hover:text-amber-400 underline"
              >
                Journal
              </Link>
              <span>•</span>
              <Link
                href="/contact"
                className="text-amber-500 hover:text-amber-400 underline"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
