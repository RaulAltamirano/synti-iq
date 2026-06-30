import { ref, computed } from 'vue';
import QRCode from 'qrcode';
import { ApiService } from '@/modules/services/api-service';
import {
  MyReferralCodeResponse,
  ReferralStats,
  ReferralRecord,
} from '@/modules/auth/interfaces/admin-register.types';

interface PaginatedReferralsPayload {
  items: ReferralRecord[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

const api = ApiService.getInstance().api;

export interface ReferrerInfo {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  referredAt: Date;
}

export interface ShareUrls {
  whatsapp: string;
  twitter: string;
  facebook: string;
  email: string;
}

const QR_OPTIONS = {
  width: 200,
  margin: 2,
  color: { dark: '#1f2937', light: '#ffffff' },
  errorCorrectionLevel: 'M' as const,
};

const COPY_SUCCESS_DURATION = 2000;

function getErrorMessage(err: unknown, fallback: string): string {
  const axiosErr = err as { response?: { status?: number }; message?: string };
  if (axiosErr?.response?.status === 403) return fallback;
  if (err instanceof Error) {
    const m = err.message;
    if (m === 'Network Error' || m.toLowerCase().includes('network')) {
      return 'Unable to reach the server. Check your connection and try again.';
    }
    return m;
  }
  return fallback;
}

function setCopySuccess(ref: { value: boolean }) {
  ref.value = true;
  setTimeout(() => (ref.value = false), COPY_SUCCESS_DURATION);
}

export function useReferral() {
  const referralCode = ref('');
  const referrerInfo = ref<ReferrerInfo | null>(null);
  const qrCodeSvg = ref('');
  const isLoadingQR = ref(false);
  const copySuccess = ref(false);
  const isSharing = ref(false);
  const isLoadingCode = ref(false);
  const isLoadingReferrals = ref(false);
  const myReferrals = ref<ReferralRecord[]>([]);
  const referralStats = ref<ReferralStats | null>(null);
  const error = ref<string | null>(null);

  const baseUrl = computed(() =>
    typeof window !== 'undefined' ? window.location.origin : 'https://syntiiq.com'
  );
  const referralLink = computed(() =>
    referralCode.value ? `${baseUrl.value}/auth/register-business?ref=${referralCode.value}` : ''
  );
  const hasReferrals = computed(() => (myReferrals.value ?? []).length > 0);
  const canUseWebShare = computed(() => typeof navigator !== 'undefined' && !!navigator.share);

  const fetchReferralCode = async () => {
    isLoadingCode.value = true;
    error.value = null;
    try {
      const res = await api.get('/referrals/me/code');
      const payload = (res.data as { data?: MyReferralCodeResponse })?.data ?? res.data ?? {};
      referralCode.value = payload.code ?? '';
      if (referralCode.value) await generateQRCode(referralLink.value);
    } catch (err) {
      error.value = getErrorMessage(err, 'You do not have permission to access referral codes.');
    } finally {
      isLoadingCode.value = false;
    }
  };

  const fetchReferrerInfo = async () => {
    try {
      const res = await api.get('/referrals/me/referrer');
      const payload = (res.data as { data?: { referrer: ReferrerInfo | null } })?.data ?? res.data;
      referrerInfo.value = payload?.referrer ?? null;
    } catch {
      referrerInfo.value = null;
    }
  };

  const currentReferralsPage = ref(1);
  const hasMoreReferrals = ref(false);
  const totalReferralsCount = ref(0);
  const totalReferralsPages = ref(1);

  const fetchReferralStats = async () => {
    try {
      const res = await api.get('/referrals/me/stats');
      const payload = (res.data as { data?: ReferralStats })?.data ?? res.data ?? {};
      referralStats.value = payload ?? null;
    } catch (err) {
      error.value = getErrorMessage(err, 'You do not have permission to view referral stats.');
    }
  };

  const fetchMyReferrals = async (page: number = 1, append: boolean = false) => {
    isLoadingReferrals.value = true;
    error.value = null;
    try {
      const res = await api.get('/referrals/me', {
        params: { page, limit: 20 },
      });
      const payload = (res.data as { data?: PaginatedReferralsPayload })?.data ?? res.data ?? {};
      const items = payload.items ?? [];
      const total = payload.total ?? 0;
      const totalPages = payload.totalPages ?? 1;

      if (append) {
        myReferrals.value = [...myReferrals.value, ...items];
      } else {
        myReferrals.value = items;
      }

      totalReferralsCount.value = total;
      totalReferralsPages.value = totalPages;
      hasMoreReferrals.value = page < totalPages;
      currentReferralsPage.value = page;
    } catch (err) {
      error.value = getErrorMessage(err, 'You do not have permission to view referrals.');
    } finally {
      isLoadingReferrals.value = false;
    }
  };

  const loadMoreReferrals = () => {
    if (!hasMoreReferrals.value || isLoadingReferrals.value) return;
    return fetchMyReferrals(currentReferralsPage.value + 1, true);
  };

  const goToReferralsPage = (page: number) => {
    if (page < 1 || page > totalReferralsPages.value || isLoadingReferrals.value) return;
    return fetchMyReferrals(page, false);
  };

  const initializeReferralData = () =>
    Promise.all([
      fetchReferralCode(),
      fetchReferrerInfo(),
      fetchReferralStats(),
      fetchMyReferrals(1),
    ]);

  const generateQRCode = async (text: string) => {
    if (!text) return '';
    isLoadingQR.value = true;
    try {
      const svg = await QRCode.toString(text, { type: 'svg', ...QR_OPTIONS });
      qrCodeSvg.value = svg;
      return svg;
    } catch {
      return '';
    } finally {
      isLoadingQR.value = false;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopySuccess(copySuccess);
        return true;
      }
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) setCopySuccess(copySuccess);
      return ok;
    } catch {
      return false;
    }
  };

  const copyReferralCode = () => copyToClipboard(referralCode.value);
  const copyReferralLink = () => copyToClipboard(referralLink.value);

  const shareViaWebShare = async () => {
    if (!canUseWebShare.value) return false;
    isSharing.value = true;
    try {
      await navigator.share({
        title: 'Join SyntiIQ',
        text: `Join SyntiIQ using my referral code: ${referralCode.value}!`,
        url: referralLink.value,
      });
      return true;
    } catch {
      return false;
    } finally {
      isSharing.value = false;
    }
  };

  const shareUrls = computed((): ShareUrls => {
    const url = encodeURIComponent(referralLink.value);
    const text = encodeURIComponent(
      `Join SyntiIQ using my referral code! Register here: ${referralLink.value}`
    );
    const short = encodeURIComponent(`Join SyntiIQ using my code: ${referralCode.value}!`);
    const subj = encodeURIComponent('I invite you to SyntiIQ');
    const body = encodeURIComponent(
      `Hi,\n\nI invite you to join SyntiIQ!\n\nUse my referral code: ${referralCode.value}\n\nOr register: ${referralLink.value}\n\nBest regards!`
    );
    return {
      whatsapp: `https://wa.me/?text=${text}`,
      twitter: `https://twitter.com/intent/tweet?text=${short}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      email: `mailto:?subject=${subj}&body=${body}`,
    };
  });

  const openShareUrl = (platform: keyof ShareUrls) => {
    const url = shareUrls.value[platform];
    if (platform === 'email') window.location.href = url;
    else window.open(url, '_blank', 'noopener');
  };

  const downloadQR = async () => {
    if (!referralLink.value) return;
    const dataUrl = await QRCode.toDataURL(referralLink.value, { ...QR_OPTIONS, width: 400 });
    const a = document.createElement('a');
    a.download = `syntiiq-referral-${referralCode.value}.png`;
    a.href = dataUrl;
    a.click();
  };

  const formatReferredDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(
      new Date(date)
    );

  const getReferralDisplayName = (r: { firstName?: string; lastName?: string }) =>
    [r.firstName, r.lastName].filter(Boolean).join(' ') || 'Unknown';

  return {
    referralCode,
    referrerInfo,
    referralLink,
    qrCodeSvg,
    isLoadingQR,
    isLoadingCode,
    copySuccess,
    isSharing,
    myReferrals,
    referralStats,
    error,
    canUseWebShare,
    hasReferrals,
    initializeReferralData,
    copyReferralCode,
    copyReferralLink,
    shareViaWebShare,
    openShareUrl,
    downloadQR,
    formatReferredDate,
    getReferralDisplayName,
    generateQRCode,
    loadMoreReferrals,
    hasMoreReferrals,
    totalReferralsCount,
    totalReferralsPages,
    isLoadingReferrals,
    goToReferralsPage,
  };
}
