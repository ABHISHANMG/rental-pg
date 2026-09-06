/**
 * PG Details (Requirement §12). Full-bleed image gallery, all property sections and a
 * sticky Enquire / Book CTA. Enquiry + booking run through their respective sheets.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Surface, Badge, Rating, Icon, Button, Divider, Avatar, LoadingState, ErrorState } from '@/components';
import FavoriteButton from '@/components/consumer/FavoriteButton';
import EnquirySheet from '@/components/consumer/EnquirySheet';
import ReviewSheet from '@/components/consumer/ReviewSheet';
import { usePG } from '@/hooks/usePGs';
import { useAsync } from '@/hooks/useAsync';
import { getReviews, summarize } from '@/services/reviews.service';
import { useAppStore } from '@/store/app.store';
import { usePreviewStore, PREVIEW_ID } from '@/store/preview.store';
import { AMENITY_MAP, GENDER_MAP, PROPERTY_TYPES, ROOM_TYPE_MAP } from '@/constants';
import { formatMoney, formatDate, getAvailableBeds, getTotalBeds, getMinRent } from '@/utils';
import { colors, radius as R, spacing, typography } from '@/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const GALLERY_H = 300;

function Section({ title, children, style }) {
  return (
    <View style={[{ paddingHorizontal: spacing.xl, marginBottom: spacing.xxl }, style]}>
      {title ? <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink, marginBottom: spacing.md }}>{title}</Text> : null}
      {children}
    </View>
  );
}

function RuleRow({ icon, label, value }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={18} color={colors.ink} />
      </View>
      <Text style={{ flex: 1, fontSize: typography.body, fontWeight: typography.semibold, color: colors.inkSoft }}>{label}</Text>
      <Text style={{ fontSize: typography.body, fontWeight: typography.bold, color: colors.ink }}>{value}</Text>
    </View>
  );
}

export default function PGDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isPreview = id === PREVIEW_ID; // rendering an unsaved draft from the wizard
  const previewPg = usePreviewStore((s) => s.pg);
  const { data, isLoading, isError, refetch } = usePG(isPreview ? undefined : id);
  const pg = isPreview ? previewPg : data;
  const addRecentlyViewed = useAppStore((s) => s.addRecentlyViewed);

  const [gIndex, setGIndex] = useState(0);
  const [enquiry, setEnquiry] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const viewedRef = useRef(false);

  const reviews = useAsync(() => getReviews(id), [id], { enabled: !!id && !isPreview, initialData: [] });
  const reviewSummary = summarize(reviews.data || []);

  const callProvider = () => {
    const phone = (pg?.seller?.phone || '').replace(/[^\d+]/g, '');
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  useEffect(() => {
    if (pg && !isPreview && !viewedRef.current) {
      viewedRef.current = true;
      addRecentlyViewed(pg.id);
    }
  }, [pg, isPreview, addRecentlyViewed]);

  if (isLoading && !isPreview) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <LoadingState message="Loading property…" />
      </View>
    );
  }
  if (isError || !pg) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', paddingTop: insets.top }}>
        <ErrorState title="Property unavailable" message="We couldn't load this listing. It may have been removed." onRetry={refetch} />
        <View style={{ alignItems: 'center' }}>
          <Button title="Go back" variant="ghost" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const totalBeds = getTotalBeds(pg);
  const availableBeds = getAvailableBeds(pg);
  const gender = GENDER_MAP[pg.gender];
  const propType = PROPERTY_TYPES.find((p) => p.key === pg.propertyType);
  const occupancy = totalBeds ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Gallery */}
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setGIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))}
          >
            {pg.images.map((uri, i) => (
              <Image key={i} source={{ uri }} style={{ width: SCREEN_W, height: GALLERY_H, backgroundColor: colors.surfaceSunken }} resizeMode="cover" />
            ))}
          </ScrollView>

          {/* dots */}
          <View style={{ position: 'absolute', bottom: spacing.md, alignSelf: 'center', flexDirection: 'row', gap: 6 }}>
            {pg.images.map((_, i) => (
              <View key={i} style={{ width: i === gIndex ? 20 : 7, height: 7, borderRadius: 4, backgroundColor: i === gIndex ? colors.ink : colors.surface, borderWidth: 1, borderColor: colors.border }} />
            ))}
          </View>

          {/* top controls */}
          <View style={{ position: 'absolute', top: insets.top + spacing.xs, left: spacing.lg, right: spacing.lg, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Pressable onPress={() => router.back()} accessibilityLabel="Go back" style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="arrow-left" size={22} color={colors.ink} />
            </Pressable>
            <FavoriteButton pgId={pg.id} size={22} />
          </View>
        </View>

        {/* Title block */}
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, marginBottom: spacing.xl }}>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: spacing.sm }}>
            {pg.isVerified ? <Badge label="Verified" tone="mintBg" icon="check-decagram" small /> : null}
            {propType ? <Badge label={propType.label} tone="lilac" small /> : null}
            {gender ? <Badge label={gender.label} tone="peach" icon={gender.icon} small /> : null}
          </View>
          <Text style={{ fontSize: typography.h1, fontWeight: typography.heavy, color: colors.ink, letterSpacing: -0.4 }}>{pg.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm }}>
            <Icon name="map-marker" size={16} color={colors.inkSoft} />
            <Text style={{ flex: 1, fontSize: typography.body, fontWeight: typography.medium, color: colors.inkSoft }}>
              {pg.address.addressLine}, {pg.address.locality}, {pg.address.city}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md }}>
            <Rating value={pg.rating} count={pg.reviewCount} />
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.inkFaint }} />
            <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: availableBeds ? colors.mint : colors.inkFaint }}>
              {availableBeds ? `${availableBeds} beds available` : 'Fully occupied'}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Section title="About this place">
          <Text style={{ fontSize: typography.bodyLg, lineHeight: 24, color: colors.inkSoft, fontWeight: typography.regular }}>{pg.description}</Text>
        </Section>

        {/* Amenities */}
        <Section title="Amenities">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {pg.amenities.map((key) => {
              const a = AMENITY_MAP[key];
              return (
                <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 8 }}>
                  <Icon name={a?.icon || 'check-circle-outline'} size={16} color={colors.ink} />
                  <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.ink }}>{a?.label || key}</Text>
                </View>
              );
            })}
          </View>
        </Section>

        {/* Availability summary */}
        <Section title="Availability">
          <Surface offset={4} radius={R.lg}>
            <View style={{ flexDirection: 'row', padding: spacing.lg }}>
              {[{ label: 'Total beds', value: totalBeds, tone: 'lilac' }, { label: 'Available', value: availableBeds, tone: 'mintBg' }, { label: 'Occupancy', value: `${occupancy}%`, tone: 'lemon' }].map((s, i) => (
                <View key={s.label} style={{ flex: 1, alignItems: 'center', borderLeftWidth: i ? 1 : 0, borderLeftColor: colors.surfaceSunken }}>
                  <Text style={{ fontSize: typography.h2, fontWeight: typography.heavy, color: colors.ink }}>{s.value}</Text>
                  <Text style={{ fontSize: typography.micro, fontWeight: typography.bold, color: colors.inkSoft, marginTop: 2 }}>{s.label.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </Surface>
        </Section>

        {/* Rooms */}
        <Section title="Room options">
          {pg.rooms.map((room) => {
            const meta = ROOM_TYPE_MAP[room.roomType];
            const soldOut = room.availableBeds <= 0;
            return (
              <Surface key={room.id} offset={3} radius={R.lg} style={{ marginBottom: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md }}>
                  <View style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: colors.lilac, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="bed" size={22} color={colors.ink} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: typography.bodyLg, fontWeight: typography.heavy, color: colors.ink }}>
                      {meta?.label || room.roomType}{room.floor ? ` · Floor ${room.floor}` : ''}
                    </Text>
                    <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: soldOut ? colors.inkFaint : colors.mint, marginTop: 2 }}>
                      {soldOut ? 'Fully occupied' : `${room.availableBeds} of ${room.totalBeds} beds free`}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink }}>{formatMoney(room.monthlyRent)}</Text>
                    <Text style={{ fontSize: typography.micro, fontWeight: typography.semibold, color: colors.inkSoft }}>/month</Text>
                  </View>
                </View>
              </Surface>
            );
          })}
        </Section>

        {/* Pricing / charges */}
        <Section title="Pricing details">
          <View style={{ backgroundColor: colors.surface, borderRadius: R.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: typography.body, color: colors.inkSoft }}>Starting rent</Text>
              <Text style={{ fontSize: typography.body, fontWeight: typography.bold, color: colors.ink }}>{formatMoney(getMinRent(pg))} /mo</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: typography.body, color: colors.inkSoft }}>Security deposit</Text>
              <Text style={{ fontSize: typography.body, fontWeight: typography.bold, color: colors.ink }}>Up to 2 months rent</Text>
            </View>
            {pg.charges?.maintenance ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: typography.body, color: colors.inkSoft }}>Maintenance</Text>
                <Text style={{ fontSize: typography.body, fontWeight: typography.bold, color: colors.ink }}>{formatMoney(pg.charges.maintenance)} /mo</Text>
              </View>
            ) : null}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: typography.body, color: colors.inkSoft }}>Food</Text>
              <Text style={{ fontSize: typography.body, fontWeight: typography.bold, color: colors.ink }}>{pg.amenities.includes('food') ? 'Included' : 'Not available'}</Text>
            </View>
          </View>
        </Section>

        {/* Rules */}
        <Section title="Property rules">
          <RuleRow icon="login" label="Check-in" value={pg.rules.checkIn} />
          <Divider style={{ marginVertical: 0 }} />
          <RuleRow icon="logout" label="Check-out" value={pg.rules.checkOut} />
          <Divider style={{ marginVertical: 0 }} />
          <RuleRow icon="account-group" label="Visitors" value={pg.rules.visitors} />
          <Divider style={{ marginVertical: 0 }} />
          <RuleRow icon="smoking-off" label="Smoking" value={pg.rules.smoking} />
          <Divider style={{ marginVertical: 0 }} />
          <RuleRow icon="calendar-clock" label="Notice period" value={pg.rules.noticePeriod} />
        </Section>

        {/* Map placeholder */}
        <Section title="Location">
          <Surface offset={4} radius={R.lg}>
            <View style={{ height: 150, backgroundColor: colors.mintBg, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icon name="map-marker-radius" size={40} color={colors.ink} />
              <Text style={{ fontSize: typography.caption, fontWeight: typography.bold, color: colors.ink }}>
                {pg.address.latitude.toFixed(3)}, {pg.address.longitude.toFixed(3)}
              </Text>
              <Text style={{ fontSize: typography.micro, fontWeight: typography.semibold, color: colors.inkSoft }}>Interactive map coming soon</Text>
            </View>
          </Surface>
        </Section>

        {/* Seller */}
        <Section title="Listed by">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: R.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg }}>
            <Avatar name={pg.seller.name} size={52} tone="lemon" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: typography.bodyLg, fontWeight: typography.heavy, color: colors.ink }}>{pg.seller.name}</Text>
              <Text style={{ fontSize: typography.caption, fontWeight: typography.medium, color: colors.inkSoft }}>Property owner · since {pg.seller.since}</Text>
            </View>
            <Pressable onPress={callProvider} accessibilityLabel="Call owner" style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.mintBg, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="phone" size={20} color={colors.ink} />
            </Pressable>
          </View>
        </Section>

        {/* Reviews & feedback */}
        {!isPreview ? (
          <Section title="Ratings & reviews">
            <Surface offset={4} radius={R.lg} style={{ marginBottom: spacing.md }}>
              <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
                <View style={{ alignItems: 'center', minWidth: 84 }}>
                  <Text style={{ fontSize: 36, fontWeight: typography.heavy, color: colors.ink, letterSpacing: -1 }}>
                    {(reviewSummary.count ? reviewSummary.average : pg.rating).toFixed(1)}
                  </Text>
                  <Rating value={reviewSummary.count ? reviewSummary.average : pg.rating} showCount={false} size={13} />
                  <Text style={{ fontSize: typography.micro, fontWeight: typography.bold, color: colors.inkSoft, marginTop: 2 }}>
                    {reviewSummary.count || pg.reviewCount} reviews
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-start', gap: 6 }}>
                  <Text style={{ fontSize: typography.caption, fontWeight: typography.medium, color: colors.inkSoft }}>Stayed here? Share your experience.</Text>
                  <Button title="Write a review" variant="primary" size="sm" icon="star-plus" onPress={() => setReviewOpen(true)} />
                </View>
              </View>
            </Surface>

            {(reviews.data || []).map((r) => (
              <View key={r.id} style={{ paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.surfaceSunken }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
                    <Avatar name={r.name} size={38} tone="lilac" />
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={{ fontSize: typography.body, fontWeight: typography.bold, color: colors.ink }}>{r.name}</Text>
                      <Text style={{ fontSize: typography.micro, fontWeight: typography.medium, color: colors.inkFaint }}>{formatDate(r.createdAt)}</Text>
                    </View>
                  </View>
                  <Rating value={r.rating} showCount={false} size={12} />
                </View>
                {r.comment ? (
                  <Text style={{ fontSize: typography.body, color: colors.inkSoft, lineHeight: 21, marginTop: 8 }}>{r.comment}</Text>
                ) : null}
              </View>
            ))}
          </Section>
        ) : null}
      </ScrollView>

      {/* Sticky bar — preview mode shows an exit banner instead of the tenant CTAs */}
      {isPreview ? (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.ink, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.xs, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Icon name="eye" size={22} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: typography.caption, fontWeight: typography.heavy, color: colors.white }}>Preview mode</Text>
            <Text style={{ fontSize: typography.micro, fontWeight: typography.medium, color: 'rgba(255,255,255,0.7)' }}>This is how tenants see your listing</Text>
          </View>
          <Button title="Close" variant="accent" size="sm" icon="check" onPress={() => router.back()} />
        </View>
      ) : (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.xs, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{ flexShrink: 0 }}>
            <Text style={{ fontSize: typography.micro, fontWeight: typography.bold, color: colors.inkSoft }}>STARTING</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={{ fontSize: typography.h3, fontWeight: typography.heavy, color: colors.ink }}>{formatMoney(getMinRent(pg))}</Text>
              <Text style={{ fontSize: typography.micro, fontWeight: typography.semibold, color: colors.inkSoft }}> /mo</Text>
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end' }}>
            <Button title="Call" variant="surface" size="sm" icon="phone" onPress={callProvider} />
            <Button title="Enquire" variant="primary" size="sm" icon="message-text" onPress={() => setEnquiry(true)} />
          </View>
        </View>
      )}

      {!isPreview ? (
        <>
          <EnquirySheet visible={enquiry} onClose={() => setEnquiry(false)} pg={pg} />
          <ReviewSheet visible={reviewOpen} onClose={() => setReviewOpen(false)} pg={pg} onSubmitted={() => reviews.refetch()} />
        </>
      ) : null}
    </View>
  );
}
