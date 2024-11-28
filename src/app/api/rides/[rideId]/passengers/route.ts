import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { IUser, ILocation } from '@/types';
import Ride from '@/models/ride';
import { ObjectId } from 'mongodb';

interface RouteContext {
  params: {
    rideId: string;
  }
}

async function handlePassengerUpdate(
  request: Request,
  context: RouteContext,
  isAdding: boolean
) {
  try {
    await dbConnect();
    // Properly await and access the rideId parameter
    const { rideId } = params;
    const testUserId = '674759bc567b5039ccda0728';

    // Find the original ride first
    const originalRide = await Ride.findById(rideId)
      .populate('passengers')
      .lean();
    
    if (!originalRide) {
      return NextResponse.json(
        { error: 'Ride not found' },
        { status: 404 }
      );
    }

    if (isAdding) {
      // Check seats availability
      if (originalRide.passengers.length >= originalRide.seats) {
        return NextResponse.json(
          { error: 'No seats available' },
          { status: 400 }
        );
      }

      // Check if already a passenger
      if (originalRide.passengers.some(passenger => passenger._id.toString() === testUserId)) {
        return NextResponse.json(
          { error: 'User is already a passenger' },
          { status: 400 }
        );
      }

      // Update passengers using updateOne to avoid validation issues
      await Ride.updateOne(
        { _id: rideId },
        { $push: { passengers: new ObjectId(testUserId) } }
      );
    } else {
      // Remove passenger using updateOne
      await Ride.updateOne(
        { _id: rideId },
        { $pull: { passengers: new ObjectId(testUserId) } }
      );
    }

    // Fetch the updated ride with populated fields
    const updatedRide = await Ride.findById(rideId)
      .populate<{ driver: IUser }>('driver', 'name email')
      .populate<{ passengers: IUser[] }>('passengers', 'name email')
      .populate<{ startLocation: ILocation }>('startLocation', 'LocationName')
      .populate<{ endLocation: ILocation }>('endLocation', 'LocationName')
      .lean();

    // Format the response similarly to the GET route
    const formattedRide = {
      ...updatedRide,
      departureTime: updatedRide.departureTime && updatedRide.departureTime.t
        ? new Date(updatedRide.departureTime.t * 1000)
        : null,
    };

    return NextResponse.json(formattedRide);
  } catch (error) {
    console.error('Error updating passengers:', error);
    return NextResponse.json(
      { error: `Failed to ${isAdding ? 'add' : 'remove'} passenger` },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  return handlePassengerUpdate(request, { params }, true);
}

export async function DELETE(
  request: Request,
  { params }: RouteContext  // Changed from context: { params: { rideId: string } }
) {
  return handlePassengerUpdate(request, { params }, false);
}