/**
 * Add PG — multi-step listing wizard (Requirement §21).
 * Steps: Basics → Location → Photos → Amenities → Rooms & Beds → Pricing → Rules →
 * Preview → Submit. State lives in one local object; each step validates before Next.
 * On submit the property is created (PENDING_VERIFICATION) via the seller service.
 */

import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Screen, Header, Input, Button, Chip, Surface, Icon, Badge } from '@/components';
import { useDialog } from '@/hooks/useDialog';
import { usePreviewStore, PREVIEW_ID } from '@/store/preview.store';
import { AMENITIES, AMENITY_MAP, CITIES, GENDERS, PROPERTY_TYPES, ROOM_TYPES, ROOM_TYPE_MAP } from '@/constants';
import { addProperty } from '@/services/seller.service';
import { formatMoney, makeId } from '@/utils';
import { colors, radius as R, spacing, typography } from '@/theme';

const STEPS = ['Basics', 'Location', 'Photos', 'Amenities', 'Rooms & Beds', 'Pricing', 'Rules', 'Preview'];

// Sample photos the owner can add (stands in for camera/gallery in the mock milestone).
const SAMPLE_PHOTOS = ['room-a', 'room-b', 'room-c', 'room-d', 'room-e', 'room-f'].map(
  (s) => `https://picsum.photos/seed/newpg-${s}/900/650`
);

const emptyForm = {
  name: '',
  propertyType: 'PG',
  gender: 'UNISEX',
  description: '',
  address: { addressLine: '', locality: '', city: 'Hyderabad', state: '', pincode: '', latitude: 17.4, longitude: 78.4 },
  images: [],
  amenities: [],
  rooms: [],
  charges: { maintenance: '', food: '', other: '' },
  rules: { checkIn: '12:00 PM', checkOut: '11:00 AM', visitors: 'Allowed in common area', smoking: 'Not allowed', noticePeriod: '30 days' },
};

function Label({ children }) {
  return <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.ink, marginBottom: spacing.sm }}>{children}</Text>;
}

export default function AddPG() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const dialog = useDialog();
  const setPreview = usePreviewStore((s) => s.setPreview);

  // new-room sub-form ('__custom__' roomType reveals a free-text name field)
  const [room, setRoom] = useState({ roomType: 'DOUBLE', customType: '', floor: '', totalBeds: '', availableBeds: '', monthlyRent: '', securityDeposit: '' });
  const [customAmenity, setCustomAmenity] = useState('');

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setAddr = (k, v) => setForm((f) => ({ ...f, address: { ...f.address, [k]: v } }));
  const setCharge = (k, v) => setForm((f) => ({ ...f, charges: { ...f.charges, [k]: v } }));
  const setRule = (k, v) => setForm((f) => ({ ...f, rules: { ...f.rules, [k]: v } }));

  const toggleAmenity = (key) =>
    setForm((f) => ({ ...f, amenities: f.amenities.includes(key) ? f.amenities.filter((a) => a !== key) : [...f.amenities, key] }));

  const removeAmenity = (key) => setForm((f) => ({ ...f, amenities: f.amenities.filter((a) => a !== key) }));

  const addCustomAmenity = () => {
    const label = customAmenity.trim();
    if (!label) return;
    const exists = form.amenities.some(
      (a) => a.toLowerCase() === label.toLowerCase() || AMENITY_MAP[a]?.label.toLowerCase() === label.toLowerCase()
    );
    if (!exists) setForm((f) => ({ ...f, amenities: [...f.amenities, label] }));
    setCustomAmenity('');
  };

  const addImages = (uris) =>
    setForm((f) => ({ ...f, images: [...f.images, ...uris.filter((u) => u && !f.images.includes(u))] }));
  const removeImage = (uri) => setForm((f) => ({ ...f, images: f.images.filter((i) => i !== uri) }));

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return dialog.alert({ title: 'Permission needed', message: 'Allow photo access to upload photos of your PG.', icon: 'image-off' });
    const res = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, selectionLimit: 8, quality: 0.7 });
    if (!res.canceled) addImages(res.assets.map((a) => a.uri));
  };
  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return dialog.alert({ title: 'Permission needed', message: 'Allow camera access to photograph your PG.', icon: 'camera-off' });
    try {
      const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
      if (!res.canceled) addImages(res.assets.map((a) => a.uri));
    } catch (e) {
      // e.g. the iOS simulator has no camera
      dialog.alert({ title: 'Camera unavailable', message: 'This device has no camera available. Try Upload instead.', icon: 'camera-off' });
    }
  };
  const addSample = () => {
    const next = SAMPLE_PHOTOS.find((s) => !form.images.includes(s));
    if (next) addImages([next]);
    else dialog.alert({ title: 'No more samples', message: 'You have added all the sample photos.', icon: 'image-multiple' });
  };

  const addRoom = () => {
    const isCustom = room.roomType === '__custom__';
    const finalType = isCustom ? room.customType.trim() : room.roomType;
    if (isCustom && !finalType) return dialog.alert({ title: 'Add room', message: 'Enter a name for your custom room type.', icon: 'bed' });
    const beds = Number(room.totalBeds);
    const rent = Number(room.monthlyRent);
    if (!beds || beds < 1) return dialog.alert({ title: 'Add room', message: 'Enter the total number of beds.', icon: 'bed' });
    if (!rent || rent < 1) return dialog.alert({ title: 'Add room', message: 'Enter the monthly rent.', icon: 'cash' });
    const avail = Math.min(beds, Number(room.availableBeds) || beds);
    setForm((f) => ({
      ...f,
      rooms: [
        ...f.rooms,
        { id: makeId('room'), roomType: finalType, floor: room.floor.trim(), totalBeds: beds, availableBeds: avail, monthlyRent: rent, securityDeposit: Number(room.securityDeposit) || rent * 2, amenities: [] },
      ],
    }));
    setRoom({ roomType: 'DOUBLE', customType: '', floor: '', totalBeds: '', availableBeds: '', monthlyRent: '', securityDeposit: '' });
  };

  const removeRoom = (id) => setForm((f) => ({ ...f, rooms: f.rooms.filter((r) => r.id !== id) }));

  // per-step validation
  const validateStep = () => {
    switch (step) {
      case 0:
        if (form.name.trim().length < 3) return 'Enter a property name (min 3 characters).';
        if (form.description.trim().length < 10) return 'Add a short description (min 10 characters).';
        return null;
      case 1:
        if (!form.address.locality.trim()) return 'Enter the locality.';
        if (!form.address.city.trim()) return 'Select a city.';
        if (form.address.pincode.length !== 6) return 'Enter a valid 6-digit pincode.';
        return null;
      case 2:
        if (form.images.length < 1) return 'Add at least one photo.';
        return null;
      case 4:
        if (form.rooms.length < 1) return 'Add at least one room type.';
        return null;
      default:
        return null;
    }
  };

  const next = () => {
    const err = validateStep();
    if (err) return dialog.alert({ title: 'Almost there', message: err, icon: 'alert-circle-outline' });
    if (step < STEPS.length - 1) setStep(step + 1);
  };
  const back = () => (step === 0 ? router.back() : setStep(step - 1));

  // amenities not in the predefined catalog = the owner's custom entries
  const customAmenities = form.amenities.filter((a) => !AMENITY_MAP[a]);

  // Build a PG-shaped draft and open it in the real consumer detail screen (read-only).
  const buildDraftPG = () => ({
    id: PREVIEW_ID,
    sellerId: 'me',
    name: form.name.trim() || 'Untitled PG',
    description: form.description.trim() || 'No description added yet.',
    propertyType: form.propertyType,
    gender: form.gender,
    address: form.address,
    images: form.images.length ? form.images : ['https://picsum.photos/seed/preview/900/650'],
    amenities: form.amenities,
    rooms: form.rooms,
    rating: 0,
    reviewCount: 0,
    isVerified: false,
    isActive: true,
    charges: { maintenance: Number(form.charges.maintenance) || 0, food: Number(form.charges.food) || 0, other: Number(form.charges.other) || 0 },
    rules: form.rules,
    seller: { name: 'You (owner)', phone: '', since: String(new Date().getFullYear()) },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const openPreview = () => {
    if (!form.rooms.length) return dialog.alert({ title: 'Add a room first', message: 'Add at least one room type so tenants can see pricing.', icon: 'bed' });
    setPreview(buildDraftPG());
    router.push(`/pg/${PREVIEW_ID}`);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await addProperty({
        name: form.name.trim(),
        description: form.description.trim(),
        propertyType: form.propertyType,
        gender: form.gender,
        address: { ...form.address, pincode: form.address.pincode },
        images: form.images,
        amenities: form.amenities,
        rooms: form.rooms,
        charges: { maintenance: Number(form.charges.maintenance) || 0, food: Number(form.charges.food) || 0, other: Number(form.charges.other) || 0 },
        rules: form.rules,
        seller: { name: 'You', phone: '', since: String(new Date().getFullYear()) },
      });
      dialog.alert({
        title: 'Submitted for review',
        message: 'Your PG has been submitted and is pending verification.',
        icon: 'check-decagram',
        tone: 'success',
        confirmLabel: 'Done',
        onConfirm: () => router.replace('/(seller)/listings'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Header showBack onBack={back} title="Add a PG" subtitle={`Step ${step + 1} of ${STEPS.length} · ${STEPS[step]}`} />

      {/* progress bar */}
      <View style={{ flexDirection: 'row', gap: 4, paddingHorizontal: spacing.xl, marginBottom: spacing.md }}>
        {STEPS.map((_, i) => (
          <View key={i} style={{ flex: 1, height: 6, borderRadius: 3, borderWidth: 1, borderColor: colors.border, backgroundColor: i <= step ? colors.primary : colors.surface }} />
        ))}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.huge, gap: spacing.lg }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* STEP 0 — Basics */}
          {step === 0 && (
            <>
              <Input label="PG name" icon="home" autoCapitalize="words" placeholder="e.g. Urban Nest PG" value={form.name} onChangeText={(t) => setField('name', t)} />
              <View>
                <Label>Property type</Label>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {PROPERTY_TYPES.map((p) => (
                    <Chip key={p.key} label={p.label} selected={form.propertyType === p.key} onPress={() => setField('propertyType', p.key)} />
                  ))}
                </View>
              </View>
              <View>
                <Label>Who is it for?</Label>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {GENDERS.map((g) => (
                    <Chip key={g.key} label={g.label} icon={g.icon} selected={form.gender === g.key} onPress={() => setField('gender', g.key)} />
                  ))}
                </View>
              </View>
              <Input label="Description" placeholder="Tell tenants what makes your PG great…" multiline value={form.description} onChangeText={(t) => setField('description', t)} maxLength={400} />
            </>
          )}

          {/* STEP 1 — Location */}
          {step === 1 && (
            <>
              <Input label="Address line" icon="map-marker" autoCapitalize="words" placeholder="Building, street" value={form.address.addressLine} onChangeText={(t) => setAddr('addressLine', t)} />
              <Input label="Locality" autoCapitalize="words" placeholder="e.g. Madhapur" value={form.address.locality} onChangeText={(t) => setAddr('locality', t)} />
              <View>
                <Label>City</Label>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {CITIES.map((c) => (
                    <Chip key={c} label={c} selected={form.address.city === c} onPress={() => setAddr('city', c)} />
                  ))}
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <Input label="State" autoCapitalize="words" placeholder="State" value={form.address.state} onChangeText={(t) => setAddr('state', t)} style={{ flex: 1 }} />
                <Input label="Pincode" keyboardType="number-pad" maxLength={6} placeholder="500081" value={form.address.pincode} onChangeText={(t) => setAddr('pincode', t.replace(/\D/g, ''))} style={{ flex: 1 }} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.skyBg, borderRadius: R.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md }}>
                <Icon name="map-marker-radius" size={18} color={colors.ink} />
                <Text style={{ flex: 1, fontSize: typography.caption, fontWeight: typography.medium, color: colors.ink }}>Map pin & GPS coordinates can be set once map integration is added.</Text>
              </View>
            </>
          )}

          {/* STEP 2 — Photos */}
          {step === 2 && (
            <>
              <Text style={{ fontSize: typography.body, color: colors.inkSoft }}>Add photos of your PG. The first one becomes the cover image.</Text>

              {/* Camera + Upload */}
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <Button title="Camera" icon="camera" variant="ink" onPress={pickFromCamera} style={{ flex: 1 }} />
                <Button title="Upload" icon="image-multiple" variant="primary" onPress={pickFromGallery} style={{ flex: 1 }} />
              </View>

              {/* Added photos grid */}
              {form.images.length ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
                  {form.images.map((uri, idx) => (
                    <View key={uri} style={{ width: '47%' }}>
                      <View style={{ borderRadius: R.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
                        <Image source={{ uri }} style={{ width: '100%', height: 100, backgroundColor: colors.surfaceSunken }} />
                        {idx === 0 ? <View style={{ position: 'absolute', bottom: 6, left: 6 }}><Badge label="Cover" tone="accent" small /></View> : null}
                      </View>
                      <Pressable
                        onPress={() => removeImage(uri)}
                        hitSlop={8}
                        accessibilityLabel="Remove photo"
                        style={{ position: 'absolute', top: -8, right: -8, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Icon name="close" size={16} color={colors.danger} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : (
                <Pressable onPress={pickFromGallery} style={{ borderRadius: R.lg, borderWidth: 1, borderColor: colors.inkFaint, borderStyle: 'dashed', backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.huge, gap: spacing.sm }}>
                  <Icon name="image-plus" size={40} color={colors.inkSoft} />
                  <Text style={{ fontSize: typography.body, fontWeight: typography.bold, color: colors.inkSoft }}>No photos yet</Text>
                  <Text style={{ fontSize: typography.caption, color: colors.inkFaint }}>Tap to upload from your gallery</Text>
                </Pressable>
              )}

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.inkSoft }}>{form.images.length} photo{form.images.length === 1 ? '' : 's'} added</Text>
                <Button title="Add a sample" variant="ghost" size="sm" icon="image-outline" onPress={addSample} />
              </View>
            </>
          )}

          {/* STEP 3 — Amenities */}
          {step === 3 && (
            <View>
              <Text style={{ fontSize: typography.body, color: colors.inkSoft, marginBottom: spacing.md }}>Select everything your PG offers.</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {AMENITIES.map((a) => (
                  <Chip key={a.key} label={a.label} icon={a.icon} selected={form.amenities.includes(a.key)} onPress={() => toggleAmenity(a.key)} />
                ))}
              </View>

              <View style={{ marginTop: spacing.xl }}>
                <Label>Add your own</Label>
                <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
                  <Input
                    placeholder="e.g. Gym, Terrace, Study room"
                    value={customAmenity}
                    onChangeText={setCustomAmenity}
                    onSubmitEditing={addCustomAmenity}
                    returnKeyType="done"
                    autoCapitalize="words"
                    style={{ flex: 1 }}
                  />
                  <Button title="Add" variant="ink" size="md" icon="plus" onPress={addCustomAmenity} />
                </View>
                {customAmenities.length ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}>
                    {customAmenities.map((a) => (
                      <Chip key={a} label={a} icon="close" selected onPress={() => removeAmenity(a)} />
                    ))}
                  </View>
                ) : null}
              </View>
            </View>
          )}

          {/* STEP 4 — Rooms & Beds */}
          {step === 4 && (
            <>
              {form.rooms.map((r) => (
                <Surface key={r.id} offset={3} radius={R.lg} style={{ marginBottom: spacing.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: typography.bodyLg, fontWeight: typography.heavy, color: colors.ink }}>{ROOM_TYPE_MAP[r.roomType]?.label || r.roomType}</Text>
                      <Text style={{ fontSize: typography.caption, fontWeight: typography.medium, color: colors.inkSoft }}>
                        {r.floor ? `Floor ${r.floor} · ` : ''}{r.availableBeds}/{r.totalBeds} free · {formatMoney(r.monthlyRent)}/mo · dep {formatMoney(r.securityDeposit)}
                      </Text>
                    </View>
                    <Pressable onPress={() => removeRoom(r.id)} hitSlop={8}><Icon name="trash-can-outline" size={22} color={colors.danger} /></Pressable>
                  </View>
                </Surface>
              ))}

              <Surface offset={4} radius={R.lg} background={colors.surfaceAlt}>
                <View style={{ padding: spacing.lg, gap: spacing.md }}>
                  <Text style={{ fontSize: typography.bodyStrong?.fontSize || 15, fontWeight: typography.bold, color: colors.ink }}>Add a room type</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                    {ROOM_TYPES.map((rt) => (
                      <Chip key={rt.key} label={rt.short} selected={room.roomType === rt.key} onPress={() => setRoom((r) => ({ ...r, roomType: rt.key }))} />
                    ))}
                    <Chip label="Custom" icon="pencil" selected={room.roomType === '__custom__'} onPress={() => setRoom((r) => ({ ...r, roomType: '__custom__' }))} />
                  </View>
                  {room.roomType === '__custom__' ? (
                    <Input label="Room type name" placeholder="e.g. Five Sharing, Deluxe Suite" autoCapitalize="words" value={room.customType} onChangeText={(t) => setRoom((r) => ({ ...r, customType: t }))} />
                  ) : null}
                  <Input label="Floor (optional)" icon="stairs" placeholder="e.g. Ground, 1, 2" value={room.floor} onChangeText={(t) => setRoom((r) => ({ ...r, floor: t }))} />
                  <View style={{ flexDirection: 'row', gap: spacing.md }}>
                    <Input label="Total beds" keyboardType="number-pad" placeholder="10" value={room.totalBeds} onChangeText={(t) => setRoom((r) => ({ ...r, totalBeds: t.replace(/\D/g, '') }))} style={{ flex: 1 }} />
                    <Input label="Available" keyboardType="number-pad" placeholder="4" value={room.availableBeds} onChangeText={(t) => setRoom((r) => ({ ...r, availableBeds: t.replace(/\D/g, '') }))} style={{ flex: 1 }} />
                  </View>
                  <View style={{ flexDirection: 'row', gap: spacing.md }}>
                    <Input label="Rent (₹/mo)" keyboardType="number-pad" placeholder="9000" value={room.monthlyRent} onChangeText={(t) => setRoom((r) => ({ ...r, monthlyRent: t.replace(/\D/g, '') }))} style={{ flex: 1 }} />
                    <Input label="Deposit (₹)" keyboardType="number-pad" placeholder="18000" value={room.securityDeposit} onChangeText={(t) => setRoom((r) => ({ ...r, securityDeposit: t.replace(/\D/g, '') }))} style={{ flex: 1 }} />
                  </View>
                  <Button title="Add room" variant="ink" size="sm" icon="plus" onPress={addRoom} />
                </View>
              </Surface>
            </>
          )}

          {/* STEP 5 — Pricing */}
          {step === 5 && (
            <>
              <Text style={{ fontSize: typography.body, color: colors.inkSoft }}>Optional recurring/one-time charges on top of rent.</Text>
              <Input label="Maintenance (₹/mo)" icon="broom" keyboardType="number-pad" placeholder="0" value={form.charges.maintenance} onChangeText={(t) => setCharge('maintenance', t.replace(/\D/g, ''))} />
              <Input label="Food charges (₹/mo)" icon="silverware-fork-knife" keyboardType="number-pad" placeholder="0" value={form.charges.food} onChangeText={(t) => setCharge('food', t.replace(/\D/g, ''))} />
              <Input label="Other charges (₹)" icon="cash" keyboardType="number-pad" placeholder="0" value={form.charges.other} onChangeText={(t) => setCharge('other', t.replace(/\D/g, ''))} />
            </>
          )}

          {/* STEP 6 — Rules */}
          {step === 6 && (
            <>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <Input label="Check-in" placeholder="12:00 PM" value={form.rules.checkIn} onChangeText={(t) => setRule('checkIn', t)} style={{ flex: 1 }} autoCapitalize="none" />
                <Input label="Check-out" placeholder="11:00 AM" value={form.rules.checkOut} onChangeText={(t) => setRule('checkOut', t)} style={{ flex: 1 }} autoCapitalize="none" />
              </View>
              <View>
                <Label>Smoking</Label>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  {['Not allowed', 'Designated area'].map((o) => (
                    <Chip key={o} label={o} selected={form.rules.smoking === o} onPress={() => setRule('smoking', o)} />
                  ))}
                </View>
              </View>
              <Input label="Visitor policy" autoCapitalize="sentences" placeholder="e.g. Allowed till 9 PM" value={form.rules.visitors} onChangeText={(t) => setRule('visitors', t)} />
              <View>
                <Label>Notice period</Label>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  {['15 days', '30 days', '60 days'].map((o) => (
                    <Chip key={o} label={o} selected={form.rules.noticePeriod === o} onPress={() => setRule('noticePeriod', o)} />
                  ))}
                </View>
              </View>
            </>
          )}

          {/* STEP 7 — Preview */}
          {step === 7 && (
            <>
              <Text style={{ fontSize: typography.body, color: colors.inkSoft }}>Here's how your listing looks. Submit to send it for verification.</Text>
              <Surface offset={4} radius={R.xl}>
                <View>
                  {form.images[0] ? <Image source={{ uri: form.images[0] }} style={{ width: '100%', height: 160, backgroundColor: colors.surfaceSunken }} /> : null}
                  <View style={{ padding: spacing.lg, gap: 6 }}>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <Badge label={PROPERTY_TYPES.find((p) => p.key === form.propertyType)?.label} tone="lilac" small />
                      <Badge label={GENDERS.find((g) => g.key === form.gender)?.label} tone="peach" small />
                    </View>
                    <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink }}>{form.name || 'Untitled PG'}</Text>
                    <Text style={{ fontSize: typography.caption, fontWeight: typography.medium, color: colors.inkSoft }}>{form.address.locality}, {form.address.city}</Text>
                    <Text numberOfLines={2} style={{ fontSize: typography.body, color: colors.inkSoft, marginTop: 4 }}>{form.description}</Text>
                    {form.rooms[0] ? (
                      <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink, marginTop: 4 }}>
                        {formatMoney(Math.min(...form.rooms.map((r) => r.monthlyRent)))}<Text style={{ fontSize: typography.caption, color: colors.inkSoft }}> /mo onwards</Text>
                      </Text>
                    ) : null}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                      {form.amenities.slice(0, 5).map((k) => (
                        <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceAlt, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                          <Icon name={AMENITY_MAP[k]?.icon || 'check-circle-outline'} size={12} color={colors.inkSoft} />
                          <Text style={{ fontSize: typography.micro, fontWeight: typography.bold, color: colors.inkSoft }}>{AMENITY_MAP[k]?.label || k}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </Surface>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <View style={{ flex: 1, alignItems: 'center', backgroundColor: colors.surface, borderRadius: R.md, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.md }}>
                  <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink }}>{form.rooms.length}</Text>
                  <Text style={{ fontSize: typography.micro, fontWeight: typography.bold, color: colors.inkSoft }}>ROOM TYPES</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center', backgroundColor: colors.surface, borderRadius: R.md, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.md }}>
                  <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink }}>{form.rooms.reduce((s, r) => s + r.totalBeds, 0)}</Text>
                  <Text style={{ fontSize: typography.micro, fontWeight: typography.bold, color: colors.inkSoft }}>TOTAL BEDS</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center', backgroundColor: colors.surface, borderRadius: R.md, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.md }}>
                  <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink }}>{form.amenities.length}</Text>
                  <Text style={{ fontSize: typography.micro, fontWeight: typography.bold, color: colors.inkSoft }}>AMENITIES</Text>
                </View>
              </View>

              <Button title="Preview as a tenant" variant="ink" icon="eye" onPress={openPreview} fullWidth />
            </>
          )}
        </ScrollView>

        {/* Footer nav */}
        <View style={{ flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface }}>
          <Button title={step === 0 ? 'Cancel' : 'Back'} variant="surface" onPress={back} style={{ flex: 1 }} />
          {step < STEPS.length - 1 ? (
            <Button title="Next" icon="arrow-right" iconRight variant="primary" onPress={next} style={{ flex: 1.4 }} />
          ) : (
            <Button title="Submit listing" icon="check" iconRight variant="primary" loading={submitting} onPress={submit} style={{ flex: 1.4 }} />
          )}
        </View>
      </KeyboardAvoidingView>
      {dialog.node}
    </Screen>
  );
}
