"use client";

import { useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import { Plus, Package, Trash2, Pencil } from "lucide-react";
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

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

interface PropertyDetailProps {
  propertyId: string;
}

export function PropertyDetail({ propertyId }: PropertyDetailProps) {
  const { data: property, mutate, isLoading } = useSWR(
    `/api/properties/${propertyId}`,
    fetcher
  );
  const [roomOpen, setRoomOpen] = useState(false);
  const [editRoomId, setEditRoomId] = useState<string | null>(null);
  const [inventoryOpen, setInventoryOpen] = useState<string | null>(null);
  const [roomForm, setRoomForm] = useState({ name: "", roomType: "BEDROOM" });
  const [editRoomForm, setEditRoomForm] = useState({ name: "", roomType: "BEDROOM" });
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    condition: "Good",
    photoUrls: [] as string[],
  });

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
      setRoomForm({ name: "", roomType: "BEDROOM" });

      await mutate(
        (current) =>
          current
            ? {
                ...current,
                rooms: [
                  ...(current.rooms ?? []),
                  { ...room, inventoryItems: [], roomPhotos: [] },
                ],
              }
            : current,
        { revalidate: true }
      );
      toast.success("Room added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add room");
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

      await mutate(
        (current) =>
          current
            ? {
                ...current,
                rooms: (current.rooms ?? []).map(
                  (r: { id: string; inventoryItems?: unknown[]; roomPhotos?: unknown[] }) =>
                    r.id === roomId
                      ? { ...r, name: room.name, roomType: room.roomType }
                      : r
                ),
              }
            : current,
        { revalidate: true }
      );
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

      await mutate(
        (current) =>
          current
            ? {
                ...current,
                rooms: (current.rooms ?? []).filter(
                  (room: { id: string }) => room.id !== roomId
                ),
              }
            : current,
        { revalidate: true }
      );
      toast.success("Room deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete room");
    }
  }

  async function addInventoryItem(e: React.FormEvent) {
    e.preventDefault();
    if (!inventoryOpen) return;
    const roomId = inventoryOpen;
    try {
      const res = await fetch(`/api/rooms/${roomId}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemForm),
      });
      const item = await res.json();
      if (!res.ok) throw new Error(item.error || "Failed to add item");

      setInventoryOpen(null);
      setItemForm({ name: "", description: "", condition: "Good", photoUrls: [] });

      await mutate(
        (current) =>
          current
            ? {
                ...current,
                rooms: (current.rooms ?? []).map((room: { id: string; inventoryItems?: unknown[] }) =>
                  room.id === roomId
                    ? { ...room, inventoryItems: [...(room.inventoryItems ?? []), item] }
                    : room
                ),
              }
            : current,
        { revalidate: true }
      );
      toast.success("Item added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add item");
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

      await mutate(
        (current) =>
          current
            ? {
                ...current,
                rooms: (current.rooms ?? []).map(
                  (room: { inventoryItems?: Array<{ id: string }> }) => ({
                    ...room,
                    inventoryItems: (room.inventoryItems ?? []).filter(
                      (item) => item.id !== itemId
                    ),
                  })
                ),
              }
            : current,
        { revalidate: true }
      );
      toast.success("Item deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete item");
    }
  }

  if (isLoading) return <p>Loading...</p>;
  if (!property) return <p>Property not found</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{property.address}</h1>
        <p className="text-muted-foreground">
          £{property.rentAmount}/{property.rentPeriod?.toLowerCase()} · {property.propertyType}
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Rooms & Inventory</h2>
          <Dialog open={roomOpen} onOpenChange={setRoomOpen}>
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
                <Button type="submit" className="w-full">Add Room</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {property.rooms?.map((room: {
          id: string;
          name: string;
          roomType: string;
          inventoryItems: Array<{
            id: string;
            name: string;
            condition?: string;
            description?: string;
            photos: Array<{ url: string }>;
          }>;
        }) => (
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
                    onOpenChange={(o) => setInventoryOpen(o ? room.id : null)}
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
                            setItemForm({ ...itemForm, photoUrls: [...itemForm.photoUrls, url] })
                          }
                        />
                        {itemForm.photoUrls.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {itemForm.photoUrls.length} photo(s) attached
                          </p>
                        )}
                        <Button type="submit" className="w-full">Add Item</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
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
