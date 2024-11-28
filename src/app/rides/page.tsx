'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast"
import { Check } from "lucide-react";
import { formatDateString } from '@/lib/utils';
import { RideWithLocations } from "@/types";
import { cn } from "@/lib/utils";
import PickupStations from '@/components/stationsMap/PickupStations';

export default function Rides() {
  const [rides, setRides] = useState<RideWithLocations[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingRideId, setLoadingRideId] = useState<string | null>(null);
  const [changingSeats, setChangingSeats] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  // Our test user ID - in a real app, this would come from authentication
  const TEST_USER_ID = '674759bc567b5039ccda0728';

  // Helper function to check if the user has already joined a ride
  const hasUserJoined = (ride: RideWithLocations): boolean => {
    return ride.passengers.some(passenger => passenger._id === TEST_USER_ID);
  };

  // Helper function to get the button state for a ride
const getButtonState = (ride: RideWithLocations) => {
  const isJoined = hasUserJoined(ride);
  const availableSeats = ride.seats - (ride.passengers?.length || 0);
  
  if (availableSeats <= 0 && !isJoined) {
    return {
      text: 'Full',
      variant: 'secondary' as const,
      disabled: true,
      className: 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed'
    };
  }
  
  if (isJoined) {
    return {
      text: 'Leave Ride',
      variant: 'outline' as const,
      disabled: false,
      className: 'hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700 transition-colors duration-200'
    };
  }
  
  return {
    text: 'Join Ride',
    variant: 'default' as const,
    disabled: false,
    className: 'hover:bg-green-50 hover:text-green-600 transition-colors duration-200'
  };
};

  const fetchRides = async () => {
    try {
      const response = await fetch('/api/rides');
      if (!response.ok) {
        throw new Error('Failed to fetch rides');
      }
      const data = await response.json();
      setRides(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rides');
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const handleJoinOrLeaveRide = async (rideId: string, isJoining: boolean) => {
    if (loadingRideId) return; // Prevent multiple simultaneous requests

    try {
      setLoadingRideId(rideId);
      const response = await fetch(`/api/rides/${rideId}/passengers`, {
        method: isJoining ? 'POST' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isJoining ? 'join' : 'leave'} ride`);
      }

      // Add rideId to changingSeats for animation
      setChangingSeats(prev => new Set(prev).add(rideId));

      // Remove from changingSeats after animation
      setTimeout(() => {
        setChangingSeats(prev => {
          const newSet = new Set(prev);
          newSet.delete(rideId);
          return newSet;
        });
      }, 1000);

      await fetchRides(); // Refresh the rides list
      
      toast({
        title: "Success!",
        description: `You have successfully ${isJoining ? 'joined' : 'left'} the ride.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${isJoining ? 'join' : 'leave'} ride`;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingRideId(null);
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <PickupStations width="50%" height="300px"/>
      <h1 className="text-4xl font-bold mt-8 mb-4">Available Rides</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rides.map((ride) => {
          const buttonState = getButtonState(ride);
          const isJoined = hasUserJoined(ride);
          const isLoading = loadingRideId === ride._id;
          const isChangingSeats = changingSeats.has(ride._id);
          
          return (
            <Card
              key={ride._id.toString()}
              className="shadow-lg transition-all duration-300"
            >
              <CardHeader className="relative">
                {isJoined && (
                  <div className="absolute right-4 top-4 text-green-600 bg-green-50 p-1 rounded-full">
                    <Check size={16} />
                  </div>
                )}
                <CardTitle className="text-lg pr-8">
                  {ride.startLocation?.LocationName || 'Loading...'} → {ride.endLocation?.LocationName || 'Loading...'}
                </CardTitle>
                {ride.departureTime && (
                  <p className="text-sm text-muted-foreground">
                    Departure: {ride.departureTime ? formatDateString(ride.departureTime) : "Unknown"}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ride.startLocation?.Address && (
                    <p className="text-sm">
                      <span className="font-semibold">From:</span> {ride.startLocation.Address}
                    </p>
                  )}
                  {ride.endLocation?.Address && (
                    <p className="text-sm">
                      <span className="font-semibold">To:</span> {ride.endLocation.Address}
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="font-semibold">Available Seats: </span>
                    <span>
                      {ride.seats - (ride.passengers?.length || 0)} / {ride.seats}
                    </span>
                  </p>
                  {ride.driver && (
                    <p className="text-sm">
                      <span className="font-semibold">Driver:</span> {ride.driver.name || ride.driver.email}
                    </p>
                  )}
                  
                  <Button
                    className={cn(
                      "w-full mt-4 rounded-md",
                      buttonState.className,
                      isLoading && "opacity-80"
                    )}
                    onClick={() => handleJoinOrLeaveRide(ride._id.toString(), !isJoined)}
                    disabled={buttonState.disabled || isLoading}
                    variant={buttonState.variant}
                  >
                    {isLoading ? 'Processing...' : buttonState.text}
                  </Button>
                </div>
              </CardContent>
              </Card>
          );
        })}
      </div>
    </div>
  );
}