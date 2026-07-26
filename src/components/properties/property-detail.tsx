"use client";

import { useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import { Plus, Package, Trash2, Pencil, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/shared/file-upload";
import { CONDITION_OPTIONS, ROOM_TYPE_LABELS } from "@/lib/checklists";
import { swrFetcher, reloadSWR } from "@/lib/swr";

interface InventoryPhoto {
  url: string;
}

interface RoomPhoto {
  id: string;
  url: string;
  caption?: string | null;
}

interface InventoryItem {
  id: string;
  name: string;
  condition?: string;
  description?: string;
  photos: InventoryPhoto[];
}

interface Room {
  id: string;
  name: string;
  roomType: string;
  inventoryItems: InventoryItem[];
  roomPhotos?: RoomPhoto[];
}

interface Property {
  id: string;
  address: string;
  rentAmount: string | number;
  rentPeriod?: string;
  propertyType: string;
  coverPhotoUrl?: string | null;
  rooms?: Room[];
}

interface PropertyDetailProps {
  propertyId: string;
}

export function PropertyDetail({ propertyId }: PropertyDetailProps) {
  const propertyUrl = `/api/properties/${propertyId}`;
  const { data: property, mutate, isLoading, error, isValidating } = useSWR<Property>(
    propertyUrl,
    swrFetcher
  );
  const [roomOpen, setRoomOpen] = useState(false);
  const [editRoomId, setEditRoomId] = useState<string | null>(null);
  const [inventoryOpen, setInventoryOpen] = useState<string | null>(null);
  const [roomForm, setRoomForm] = useState({
    name: "",
    roomType: "BEDROOM",
    photoUrls: [] as string[],
  });
  const [editRoomForm, setEditRoomForm] = useState({ name: "", roomType: "BEDROOM" });
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    condition: "Good",
    photoUrls: [] as string[],
  });
  const [itemSaving, setItemSaving] = useState(false);

  const emptyItemForm = {
    name: "",
    description: "",
    condition: "Good",
    photoUrls: [] as string[],
  };

  function appendItemToRoom(roomId: string, item: InventoryItem) {
    return mutate(
      (current) =>
        current
          ? {
              ...current,
              rooms: (current.rooms ?? []).map((room) =>
                room.id === roomId
                  ? { ...room, inventoryItems: [...(room.inventoryItems ?? []), item] }
                  : room
              ),
            }
          : current,
      { revalidate: false }
    );
  }

  async function addRoom(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/properties/${propertyId}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomForm),
      });
      const room = await res.json();
      if (!res.ok) throw new Error(room.error || "Failed to add room");

      setRoomOpen(false);
      setRoomForm({ name: "", roomType: "BEDROOM", photoUrls: [] });

      await reloadSWR(mutate, propertyUrl);
      toast.success("Room added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add room");
    }
  }

  async function addRoomPhoto(roomId: string, url: string) {
    try {
      const res = await fetch(`/api/rooms/${roomId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to add room photo");
      await reloadSWR(mutate, propertyUrl);
      toast.success("Room photo added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add room photo");
    }
  }

  async function deleteRoomPhoto(photoId: string) {
    try {
      const res = await fetch(`/api/room-photos/${photoId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to delete photo");
      await reloadSWR(mutate, propertyUrl);
      toast.success("Photo removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete photo");
    }
  }

  function openEditRoom(room: { id: string; name: string; roomType: string }) {
    setEditRoomForm({ name: room.name, roomType: room.roomType });
    setEditRoomId(room.id);
  }

  async function updateRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!editRoomId) return;
    const roomId = editRoomId;
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editRoomForm),
      });
      const room = await res.json();
      if (!res.ok) throw new Error(room.error || "Failed to update room");

      setEditRoomId(null);

      await reloadSWR(mutate, propertyUrl);
      toast.success("Room updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update room");
    }
  }

  async function deleteRoom(roomId: string, roomName: string) {
    if (
      !confirm(
        `Delete "${roomName}"? All inventory items in this room will also be removed.`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/rooms/${roomId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete room");
      }

      await reloadSWR(mutate, propertyUrl);
      toast.success("Room deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete room");
    }
  }

  async function addInventoryItem(e: React.FormEvent) {
    e.preventDefault();
    if (!inventoryOpen || itemSaving) return;
    const roomId = inventoryOpen;
    setItemSaving(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemForm),
      });
      const item = await res.json();
      if (!res.ok) throw new Error(item.error || "Failed to add item");

      setInventoryOpen(null);
      setItemForm(emptyItemForm);
      await appendItemToRoom(roomId, item);
      toast.success("Item added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setItemSaving(false);
    }
  }

  async function deleteItem(itemId: string) {
    if (!confirm("Delete this item?")) return;
    try {
      const res = await fetch(`/api/inventory/${itemId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete item");
      }

      await reloadSWR(mutate, propertyUrl);
      toast.success("Item deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete item");
    }
  }

  if (isLoading && !property) {
    return <p className="text-white/60">Loading rooms...</p>;
  }

  if (error && !property) {
    return (
      <div className="rounded-3xl bg-white p-6 text-neutral-950 ring-1 ring-black/5">
        <p className="font-heading text-lg font-semibold tracking-tight">
          Couldn’t load rooms
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          {error instanceof Error ? error.message : "Please try again."}
        </p>
        <Button
          type="button"
          className="mt-4 rounded-full"
          onClick={() => mutate()}
          disabled={isValidating}
        >
          {isValidating ? "Retrying..." : "Retry"}
        </Button>
      </div>
    );
  }

  if (!property) {
    return <p className="text-white/60">Property not found</p>;
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Rooms & Inventory</h2>
          <Dialog
            open={roomOpen}
            onOpenChange={(open) => {
              setRoomOpen(open);
              if (!open) setRoomForm({ name: "", roomType: "BEDROOM", photoUrls: [] });
            }}
          >
            <DialogTrigger render={<Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Room</Button>} />
            <DialogContent>
              <DialogHeader><DialogTitle>Add Room</DialogTitle></DialogHeader>
              <form onSubmit={addRoom} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    required
                    value={roomForm.name}
                    onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={roomForm.roomType}
                    onValueChange={(v) => setRoomForm({ ...roomForm, roomType: v ?? "BEDROOM" })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROOM_TYPE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Room photos</Label>
                  <FileUpload
                    label="Add photo"
                    onUpload={(url) =>
                      setRoomForm((prev) => ({
                        ...prev,
                        photoUrls: [...prev.photoUrls, url],
                      }))
                    }
                  />
                  {roomForm.photoUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {roomForm.photoUrls.map((url, index) => (
                        <div key={`${url}-${index}`} className="relative h-16 w-16 overflow-hidden rounded border">
                          <Image src={url} alt="" fill className="object-cover" unoptimized={url.startsWith("data:")} />
                          <button
                            type="button"
                            className="absolute top-0.5 right-0.5 rounded-full bg-background/80 p-0.5"
                            onClick={() =>
                              setRoomForm((prev) => ({
                                ...prev,
                                photoUrls: prev.photoUrls.filter((_, i) => i !== index),
                              }))
                            }
                            aria-label="Remove photo"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full">Add Room</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {property.rooms?.map((room) => (
          <Card key={room.id}>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{room.name}</h3>
                  <Badge variant="outline">{ROOM_TYPE_LABELS[room.roomType] ?? room.roomType}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditRoom(room)}
                    aria-label={`Edit ${room.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteRoom(room.id, room.name)}
                    aria-label={`Delete ${room.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Dialog
                    open={inventoryOpen === room.id}
                    onOpenChange={(o) => {
                      setInventoryOpen(o ? room.id : null);
                      if (!o) setItemForm(emptyItemForm);
                    }}
                  >
                    <DialogTrigger render={<Button size="sm" variant="outline"><Plus className="mr-1 h-3 w-3" />Item</Button>} />
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
                      <form onSubmit={addInventoryItem} className="space-y-4">
                        <div>
                          <Label>Name</Label>
                          <Input
                            required
                            value={itemForm.name}
                            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Condition</Label>
                          <Select
                            value={itemForm.condition}
                            onValueChange={(v) => setItemForm({ ...itemForm, condition: v ?? "Good" })}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {CONDITION_OPTIONS.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <FileUpload
                          label="Add photo"
                          onUpload={(url) =>
                            setItemForm((prev) => ({
                              ...prev,
                              photoUrls: [...prev.photoUrls, url],
                            }))
                          }
                        />
                        {itemForm.photoUrls.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              {itemForm.photoUrls.length} photo(s) attached
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {itemForm.photoUrls.map((url, index) => (
                                <div key={`${url}-${index}`} className="relative h-16 w-16 overflow-hidden rounded border">
                                  <Image src={url} alt="" fill className="object-cover" unoptimized={url.startsWith("data:")} />
                                  <button
                                    type="button"
                                    className="absolute top-0.5 right-0.5 rounded-full bg-background/80 p-0.5"
                                    onClick={() =>
                                      setItemForm((prev) => ({
                                        ...prev,
                                        photoUrls: prev.photoUrls.filter((_, i) => i !== index),
                                      }))
                                    }
                                    aria-label="Remove photo"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <Button type="submit" className="w-full" disabled={itemSaving}>
                          {itemSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            "Add Item"
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-muted-foreground">Room photos</p>
                  <FileUpload label="Add room photo" onUpload={(url) => addRoomPhoto(room.id, url)} />
                </div>
                {room.roomPhotos?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {room.roomPhotos.map((photo) => (
                      <div key={photo.id} className="group relative h-20 w-20 overflow-hidden rounded-xl border">
                        <Image
                          src={photo.url}
                          alt={`${room.name} photo`}
                          fill
                          className="object-cover"
                          unoptimized={photo.url.startsWith("data:")}
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition group-hover:opacity-100"
                          onClick={() => deleteRoomPhoto(photo.id)}
                          aria-label="Remove room photo"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No room photos yet</p>
                )}
              </div>

              {!room.inventoryItems?.length ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" /> No inventory items
                </p>
              ) : (
                <div className="grid gap-3">
                  {room.inventoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        {item.photos?.[0] ? (
                          <div className="relative h-12 w-12 overflow-hidden rounded">
                            <Image src={item.photos[0].url} alt={item.name} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.condition}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => deleteItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </section>

      <Dialog open={editRoomId !== null} onOpenChange={(open) => { if (!open) setEditRoomId(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Room</DialogTitle></DialogHeader>
          <form onSubmit={updateRoom} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                required
                value={editRoomForm.name}
                onChange={(e) => setEditRoomForm({ ...editRoomForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={editRoomForm.roomType}
                onValueChange={(v) => setEditRoomForm({ ...editRoomForm, roomType: v ?? "BEDROOM" })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ROOM_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
