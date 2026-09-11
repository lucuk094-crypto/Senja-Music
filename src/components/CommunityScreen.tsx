import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { Song } from "../types";

interface CommunityPlaylistItem {
  id: string;
  title: string;
  trackCount: string;
  creator: string;
  isVerified: boolean;
  creatorAvatar: string;
  category: "trending" | "terbaru" | "favorit";
  savesCount: string;
  covers: string[];
  sampleTrack: Song;
}

export const CommunityScreen: React.FC = () => {
  const { isCommunityOpen, setIsCommunityOpen, playTrack, feed, setSelectedCommunityPlaylist } = usePlayer();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"semua" | "trending" | "terbaru" | "favorit">("semua");
  const [savedPlaylistIds, setSavedPlaylistIds] = useState<Set<string>>(new Set(["mosaic-1", "mosaic-3"]));
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Infinite Scroll state
  const [itemsCount, setItemsCount] = useState<number>(8);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerTargetRef = useRef<HTMLDivElement>(null);

  // Base pool of community playlists
  const basePlaylists: CommunityPlaylistItem[] = useMemo(() => [
    {
      id: "mosaic-1",
      title: "Senja Syahdu & Puisi",
      trackCount: "48 lagu",
      creator: "Rian D'Masiv Fan",
      isVerified: true,
      category: "trending",
      savesCount: "14.2k",
      creatorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdNUYxGYihi4Z1zYx-YElwiNjn1t0yZKuKhFRIivdojfrGgF1_ssSw3G1zX5pXNpXxLVBsVc-n0zFRJxoH80nY0Ai0PLulNQJ6wMvWoOgSu8v-MmqwEtQz3Wg9EAIIOE1zTAMUiAMW4YstoTT_o6PepaL7CTc2MH7t-7tGhhlrP3gpPaViY5I_0LVk9xeLZiAMTnYsZb5zY4xJ770hTrIKg5JcIiDMalbvDdfdaALipZe7uokA7rdQ",
      covers: [
        "https://lh3.googleusercontent.com/aida/AEtjO1UnG_Vf7NqOA43VQ8H-S_RR0tjp-xvN3bwvYoqvtsnmJa-8KoiV93qPZ6RieS9UXUMIiAqBnyIVgK0JZlLCDZAEaTyQ-NR0nxpfRSjjOACeDgLbDxo_BjmaZsgoqACrLy2Bc4hWPGvJtVOkqxNaSwIQAvyZ7YfY_eRr0Kon8ejtnTtgsfqmL-oquZGonjz9S7ZYMan4z_Hjh00csf_vuYfAmwiAziQLxg_vdK240Q85wxBoeGFjjFctdA",
        "https://lh3.googleusercontent.com/aida/AEtjO1VWZoti0TdjS4-lTXc30mtwF-5V5bQ6MZcvZJ_yyqcR6V_NIARkGcIVMG4lDBnVVZwjqKL4mKgdFV6SsylDisBSOhdmorh-EoCsqi10d-ke_o53xqWxJWtAgny1W_GbheNJHXw8nccO8Ppljg91Wc-HZ5r8pxXYGI0BES29zQFLdkaEc5xGMXjHhLrwHaMNbUWkL8E2a8jHh0dQbZe9dmbKpM2JYCCkKFf6RqBdMtvUUJ08MHoyz2lKD-o",
        "https://lh3.googleusercontent.com/aida/AEtjO1WBaK0s1xgaCGlPriu8AWGEN2eFG59tt1uYCCctOxAwlmx4n0-_VHUSAN6tRoCsi6kZMgw1XFLryl8DTXFuSslT-Lv4cu-SRePs1dkNmxpeAsBOGatNsBiWJyp8o4mzhC6XQLjnpS433ADQ9WQLBbV2miQ75hzTzff_bS31x3VZ0W5BmWeiHLLxYf2vWtrJJANf_nr5MScvd51TBnLDnOhvB5EHRCf2t_O_HJpnnlmi2_kS2TMJdp8j88Y",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBPcpQ_IwxkIGPY5rstxAM3c0GWlOO7HbxGP3Jyr1X3xvgTCIyFkyoaNO30hbxcj-Tdvw6untXLREcFxrgT3tEsXAfnz94NZ_ybqpBhlk6fiob3RU-it-hDeyQr2l2q4R7JdsiP6FMG5ppgu9iC6xcQj53jYe4RJ74Q2n3xDTqkYszCwiBVZ548NnnkBbyzpOixw7O0y3nk_X5zZenHv-a0eii0wrca-matNTedDrUcN89HFPge7rVu",
      ],
      sampleTrack: feed.shelves?.[0]?.items?.[0] || { id: "default", title: "Loading...", artist: "Senja Musik", duration: 180, thumbnail: "" },
    },
    {
      id: "mosaic-2",
      title: "Hujan di Bandung",
      trackCount: "36 lagu",
      creator: "Dinda Kirana",
      isVerified: true,
      category: "favorit",
      savesCount: "9.8k",
      creatorAvatar: "https://lh3.googleusercontent.com/aida/AEtjO1VY4KdWS7zOzoLqOa3TRPpttDSJm5qDTedUqM3bfzBv0Nbu3DcVaY0PuPRIKyEdrkir6ULFfxUGURZq6k1XvMkyOLaj4xtCyDnb66Csd9tHQisQ3BO30-DeJHIntN2edB7fHl6FcqUBfgroZgRiyW6lLPt0huSAurxthNtnE1EmvYPFO4W_T5AIb8Qiv1oQScaDnX_idvoMBgpSJ1pBg0e7D_0B_QYNr82Fuj24UaVARVwN3kOuZ-9Xvqg",
      covers: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCqZmyY2i5k52ndpLMYNuKZeCzYRIC0n_hP1q3Di2jrcPmtnu6kVOBzbewNf5_s5-GboTUL4lx83k_eOZl8Uw8MytCl3hPqv-WvyX0_xY0C3mDLsHC5XW4soahYpuZnZQo-m4Job5vgHxGJsvlyqL3clWrkjQxjm4oLUNJqvaq32fojbVraCpucMW8iPoZTR5Q1zpND0XOGHHOQcsmkWpMLFumJauPmIcsu0icNUtFISfugFLoO2KEX",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDvNTehOZEJ72TeP78-3hYlVME6rGNVxXEhxx0Xt853Zgxniw5EOs71UpX0Zy5M2w8lFh52JsFv-qn_y-g5n2_dwnP4JfCMtsswTgGkdxI9TWGKz7_iQa7VUZ1i1-8-sKsNfbie74j-4vaCCyJ7Kne1BvHQSsRTAg00zpqIcN7FMd864TZ2diaFUVmgvgywU6Ea8yYl98NFwzGyMiuli45ttxR4fCQxvqO2ciixmErrhxmwpCJsdpev",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDvhfoIgZgFahFnUU7WNpiAVmqZXoAKCApbKGufP-hRKQZJ7ahAm7OHI_ctM4j-7LI2J0Duj5ZXPDs033oeLUPj_O4ziOGmycU5UqJ9h6GZnsCMMoK-VGcsnM-Wk_kCOu5L_XH9VHAcpUbEDdBgfO_3wLq6IKjnb6e1otY1iGPN8tEIDjNs53rmOMsN4Yge9tTaLgOuGw4o00xScjtY1VGAsD2TGxaewkk8Cl9ri0askkSjpugck2Gm",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBHca2kanI4eleEfvdsOYjZu5gxk-kFrPpgagDpAlEpiHtarTvW4440D_WKmtJWSfLNQ9bh8PFnRvz0uKj-K7sBoL7hNzv26dgpGtba_FcwC1-ZarkcfENDiBbEJxQXiI2mMp1eMdah7q8VAM0rV7inYy7mh_tGEw6fSyC53W4W1UBpUDgNnraR8FR4NmnsOdUCtC5QnRWw_74l-N5I9ZS5eBX3j6ynl9B__j_EoocX_Tl6hsFq3OTm",
      ],
      sampleTrack: feed.shelves?.[0]?.items?.[1] || { id: "default", title: "Loading...", artist: "Senja Musik", duration: 180, thumbnail: "" },
    },
    {
      id: "mosaic-3",
      title: "Indie Folk Senja",
      trackCount: "52 lagu",
      creator: "Kopi & Akustik",
      isVerified: false,
      category: "trending",
      savesCount: "22.5k",
      creatorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwLLEk-fQPUbb9afFtXXsKbpN4A8twXAukMr4jhdB-YyYDZp54G_PS1ltTA24U7HFCqzqxMprCaXNfvd1Y6gmTki_EtJ3xjSXcxYJjD80bj8h3nPDvoNcjvS5wtpBrsfn5i-OR8UZxl8tfvSy2eY1fh7FwOJzk7WVLTJvqNTCaaJEkak6HYXtyE1hErp7QCpeEAm5DFIjXFNNun0fmjisYn3gGOioVJIU37CaPNludf9EhGuwsMQ8M",
      covers: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAaPx3lGnUS6jBOJoFEl1TdLboUkxZuKz6JKWQadgGHsV-02i0n3Hncu1wljnRW7kRiwIv7w5y9aF7FwIPN4t4xaqYIviel5IBx3rOPThQQKgZlj-u94VBSeueGBBngiO7vOXjGFqEVM48DkVicR5qO5QsDdxxVVIzK7fHoXQl1eRyK4dfKHlovLT-imIOcxgx5yEBbgDX3F9fyd5TEDsnmWW5UYNthNvptKBLmqHc7h-9jykurbnvY",
        "https://lh3.googleusercontent.com/aida/AEtjO1VWZoti0TdjS4-lTXc30mtwF-5V5bQ6MZcvZJ_yyqcR6V_NIARkGcIVMG4lDBnVVZwjqKL4mKgdFV6SsylDisBSOhdmorh-EoCsqi10d-ke_o53xqWxJWtAgny1W_GbheNJHXw8nccO8Ppljg91Wc-HZ5r8pxXYGI0BES29zQFLdkaEc5xGMXjHhLrwHaMNbUWkL8E2a8jHh0dQbZe9dmbKpM2JYCCkKFf6RqBdMtvUUJ08MHoyz2lKD-o",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAdkZoCrZfylpdhXJgavAIoT4S4gqwTsqnHYExnQLVIXfwS_9PaWOMKoj-s9PC1u0S18rgvU4p-AynkhcxSFLtOXQqngwt0yaK5iV_PAw4mGTYqYDzBQz6YnZCMaM7Po5SyTvHS-dku1WiisgG1-tlzzOqIXo31n5fNG-yeFlkhEu17YkZKqUifhUmDwG54TfxsUw64_m9KBbWpMXQA6wUZBGF4xejhN2Kx7Z5zd9C1xzHHxR6OQVU1",
        "https://lh3.googleusercontent.com/aida/AEtjO1WBaK0s1xgaCGlPriu8AWGEN2eFG59tt1uYCCctOxAwlmx4n0-_VHUSAN6tRoCsi6kZMgw1XFLryl8DTXFuSslT-Lv4cu-SRePs1dkNmxpeAsBOGatNsBiWJyp8o4mzhC6XQLjnpS433ADQ9WQLBbV2miQ75hzTzff_bS31x3VZ0W5BmWeiHLLxYf2vWtrJJANf_nr5MScvd51TBnLDnOhvB5EHRCf2t_O_HJpnnlmi2_kS2TMJdp8j88Y",
      ],
      sampleTrack: feed.shelves?.[3]?.items?.[0] || { id: "default", title: "Loading...", artist: "Senja Musik", duration: 180, thumbnail: "" },
    },
    {
      id: "mosaic-4",
      title: "Secangkir Pagi",
      trackCount: "24 lagu",
      creator: "Dimas Anggara",
      isVerified: true,
      category: "terbaru",
      savesCount: "6.4k",
      creatorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-YIdwYDFPy-y1fQEMujKcMg44D-1cRu7N87MaBZ4qINKCQLb7YXvApYIumplzjbr5H13Ynd5QD21l9GwzUpkQTYjTOFrNknUbk_kxbzK0Ag35Pf64AaxewbkaRY4Gruzx5dr_F0RpYlvRc5VlKbLjByJ8R5GT99NE5X806guRz-AhcF53Fu8AKDcXJNHFmQQKXgGTgkrSWcg7fftoYSKkIC-EukADh3cC8vr3O-UkNfrffhSpgCJj",
      covers: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD7W1wqDyoCpJSrW-2wWCGnbJrvpCjhrtoi5fn7PaldRXe6a62IWtGYxUJYKRN0nOXSWfI86BguFjmko97YR_MrVSlWy3UODvtJS-FxpSwnS3tt_8-GtfVFcBiah7F-id-pA0AtnW5IAQuSVRiaGmFTUUbsveDDTCd6QXSjgwQ5hMr-oiI5fdvtGs7kDQX5ZSPKYOh4LhJJ3pDr9vT5Hk_W-jEZ0tDm9ZKVLJoZzjNvJuXJiPrA_J74",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDhhY_ThaMsWjdybI3aP836R4k-gz3lRJA4Rzp6Mat8NeCILncqyVMkmLJvRPpB3nC_qDFVaoja9yAc9x7oLNbjtAmR3twWAIKUS7mb8fdQwy_YTd5HOccACHGpZ326_0gWemp28ZcHtmGTj3cF89PCTpzy1Bvv9WkkQjkUzzeriMbFlK3fLi1CTwZqlgWQqKLIHta8Y0HpwGFol5wjSLyYIev_DP1Wm9yxfHce2auUGtfuzWk8X_GM",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBHca2kanI4eleEfvdsOYjZu5gxk-kFrPpgagDpAlEpiHtarTvW4440D_WKmtJWSfLNQ9bh8PFnRvz0uKj-K7sBoL7hNzv26dgpGtba_FcwC1-ZarkcfENDiBbEJxQXiI2mMp1eMdah7q8VAM0rV7inYy7mh_tGEw6fSyC53W4W1UBpUDgNnraR8FR4NmnsOdUCtC5QnRWw_74l-N5I9ZS5eBX3j6ynl9B__j_EoocX_Tl6hsFq3OTm",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBPcpQ_IwxkIGPY5rstxAM3c0GWlOO7HbxGP3Jyr1X3xvgTCIyFkyoaNO30hbxcj-Tdvw6untXLREcFxrgT3tEsXAfnz94NZ_ybqpBhlk6fiob3RU-it-hDeyQr2l2q4R7JdsiP6FMG5ppgu9iC6xcQj53jYe4RJ74Q2n3xDTqkYszCwiBVZ548NnnkBbyzpOixw7O0y3nk_X5zZenHv-a0eii0wrca-matNTedDrUcN89HFPge7rVu",
      ],
      sampleTrack: feed.shelves?.[3]?.items?.[1] || { id: "default", title: "Loading...", artist: "Senja Musik", duration: 180, thumbnail: "" },
    },
    {
      id: "mosaic-5",
      title: "Ruang Temu Akustik",
      trackCount: "42 lagu",
      creator: "Klub Gitar Akustik",
      isVerified: true,
      category: "trending",
      savesCount: "11.1k",
      creatorAvatar: "https://lh3.googleusercontent.com/aida/AEtjO1VY4KdWS7zOzoLqOa3TRPpttDSJm5qDTedUqM3bfzBv0Nbu3DcVaY0PuPRIKyEdrkir6ULFfxUGURZq6k1XvMkyOLaj4xtCyDnb66Csd9tHQisQ3BO30-DeJHIntN2edB7fHl6FcqUBfgroZgRiyW6lLPt0huSAurxthNtnE1EmvYPFO4W_T5AIb8Qiv1oQScaDnX_idvoMBgpSJ1pBg0e7D_0B_QYNr82Fuj24UaVARVwN3kOuZ-9Xvqg",
      covers: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAdkZoCrZfylpdhXJgavAIoT4S4gqwTsqnHYExnQLVIXfwS_9PaWOMKoj-s9PC1u0S18rgvU4p-AynkhcxSFLtOXQqngwt0yaK5iV_PAw4mGTYqYDzBQz6YnZCMaM7Po5SyTvHS-dku1WiisgG1-tlzzOqIXo31n5fNG-yeFlkhEu17YkZKqUifhUmDwG54TfxsUw64_m9KBbWpMXQA6wUZBGF4xejhN2Kx7Z5zd9C1xzHHxR6OQVU1",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDvhfoIgZgFahFnUU7WNpiAVmqZXoAKCApbKGufP-hRKQZJ7ahAm7OHI_ctM4j-7LI2J0Duj5ZXPDs033oeLUPj_O4ziOGmycU5UqJ9h6GZnsCMMoK-VGcsnM-Wk_kCOu5L_XH9VHAcpUbEDdBgfO_3wLq6IKjnb6e1otY1iGPN8tEIDjNs53rmOMsN4Yge9tTaLgOuGw4o00xScjtY1VGAsD2TGxaewkk8Cl9ri0askkSjpugck2Gm",
        "https://lh3.googleusercontent.com/aida/AEtjO1UnG_Vf7NqOA43VQ8H-S_RR0tjp-xvN3bwvYoqvtsnmJa-8KoiV93qPZ6RieS9UXUMIiAqBnyIVgK0JZlLCDZAEaTyQ-NR0nxpfRSjjOACeDgLbDxo_BjmaZsgoqACrLy2Bc4hWPGvJtVOkqxNaSwIQAvyZ7YfY_eRr0Kon8ejtnTtgsfqmL-oquZGonjz9S7ZYMan4z_Hjh00csf_vuYfAmwiAziQLxg_vdK240Q85wxBoeGFjjFctdA",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDvNTehOZEJ72TeP78-3hYlVME6rGNVxXEhxx0Xt853Zgxniw5EOs71UpX0Zy5M2w8lFh52JsFv-qn_y-g5n2_dwnP4JfCMtsswTgGkdxI9TWGKz7_iQa7VUZ1i1-8-sKsNfbie74j-4vaCCyJ7Kne1BvHQSsRTAg00zpqIcN7FMd864TZ2diaFUVmgvgywU6Ea8yYl98NFwzGyMiuli45ttxR4fCQxvqO2ciixmErrhxmwpCJsdpev",
      ],
      sampleTrack: feed.shelves?.[0]?.items?.[4] || { id: "default", title: "Loading...", artist: "Senja Musik", duration: 180, thumbnail: "" },
    },
    {
      id: "mosaic-6",
      title: "Malam Sunyi & Ngoding",
      trackCount: "60 lagu",
      creator: "Dev Senja Community",
      isVerified: true,
      category: "favorit",
      savesCount: "31.7k",
      creatorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdNUYxGYihi4Z1zYx-YElwiNjn1t0yZKuKhFRIivdojfrGgF1_ssSw3G1zX5pXNpXxLVBsVc-n0zFRJxoH80nY0Ai0PLulNQJ6wMvWoOgSu8v-MmqwEtQz3Wg9EAIIOE1zTAMUiAMW4YstoTT_o6PepaL7CTc2MH7t-7tGhhlrP3gpPaViY5I_0LVk9xeLZiAMTnYsZb5zY4xJ770hTrIKg5JcIiDMalbvDdfdaALipZe7uokA7rdQ",
      covers: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBHca2kanI4eleEfvdsOYjZu5gxk-kFrPpgagDpAlEpiHtarTvW4440D_WKmtJWSfLNQ9bh8PFnRvz0uKj-K7sBoL7hNzv26dgpGtba_FcwC1-ZarkcfENDiBbEJxQXiI2mMp1eMdah7q8VAM0rV7inYy7mh_tGEw6fSyC53W4W1UBpUDgNnraR8FR4NmnsOdUCtC5QnRWw_74l-N5I9ZS5eBX3j6ynl9B__j_EoocX_Tl6hsFq3OTm",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD7W1wqDyoCpJSrW-2wWCGnbJrvpCjhrtoi5fn7PaldRXe6a62IWtGYxUJYKRN0nOXSWfI86BguFjmko97YR_MrVSlWy3UODvtJS-FxpSwnS3tt_8-GtfVFcBiah7F-id-pA0AtnW5IAQuSVRiaGmFTUUbsveDDTCd6QXSjgwQ5hMr-oiI5fdvtGs7kDQX5ZSPKYOh4LhJJ3pDr9vT5Hk_W-jEZ0tDm9ZKVLJoZzjNvJuXJiPrA_J74",
        "https://lh3.googleusercontent.com/aida/AEtjO1VWZoti0TdjS4-lTXc30mtwF-5V5bQ6MZcvZJ_yyqcR6V_NIARkGcIVMG4lDBnVVZwjqKL4mKgdFV6SsylDisBSOhdmorh-EoCsqi10d-ke_o53xqWxJWtAgny1W_GbheNJHXw8nccO8Ppljg91Wc-HZ5r8pxXYGI0BES29zQFLdkaEc5xGMXjHhLrwHaMNbUWkL8E2a8jHh0dQbZe9dmbKpM2JYCCkKFf6RqBdMtvUUJ08MHoyz2lKD-o",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAaPx3lGnUS6jBOJoFEl1TdLboUkxZuKz6JKWQadgGHsV-02i0n3Hncu1wljnRW7kRiwIv7w5y9aF7FwIPN4t4xaqYIviel5IBx3rOPThQQKgZlj-u94VBSeueGBBngiO7vOXjGFqEVM48DkVicR5qO5QsDdxxVVIzK7fHoXQl1eRyK4dfKHlovLT-imIOcxgx5yEBbgDX3F9fyd5TEDsnmWW5UYNthNvptKBLmqHc7h-9jykurbnvY",
      ],
      sampleTrack: feed.shelves?.[0]?.items?.[2] || { id: "default", title: "Loading...", artist: "Senja Musik", duration: 180, thumbnail: "" },
    },
    {
      id: "mosaic-7",
      title: "Balada Pop 2000an",
      trackCount: "50 lagu",
      creator: "Generasi 90an",
      isVerified: false,
      category: "terbaru",
      savesCount: "8.3k",
      creatorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwLLEk-fQPUbb9afFtXXsKbpN4A8twXAukMr4jhdB-YyYDZp54G_PS1ltTA24U7HFCqzqxMprCaXNfvd1Y6gmTki_EtJ3xjSXcxYJjD80bj8h3nPDvoNcjvS5wtpBrsfn5i-OR8UZxl8tfvSy2eY1fh7FwOJzk7WVLTJvqNTCaaJEkak6HYXtyE1hErp7QCpeEAm5DFIjXFNNun0fmjisYn3gGOioVJIU37CaPNludf9EhGuwsMQ8M",
      covers: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCqZmyY2i5k52ndpLMYNuKZeCzYRIC0n_hP1q3Di2jrcPmtnu6kVOBzbewNf5_s5-GboTUL4lx83k_eOZl8Uw8MytCl3hPqv-WvyX0_xY0C3mDLsHC5XW4soahYpuZnZQo-m4Job5vgHxGJsvlyqL3clWrkjQxjm4oLUNJqvaq32fojbVraCpucMW8iPoZTR5Q1zpND0XOGHHOQcsmkWpMLFumJauPmIcsu0icNUtFISfugFLoO2KEX",
        "https://lh3.googleusercontent.com/aida/AEtjO1WBaK0s1xgaCGlPriu8AWGEN2eFG59tt1uYCCctOxAwlmx4n0-_VHUSAN6tRoCsi6kZMgw1XFLryl8DTXFuSslT-Lv4cu-SRePs1dkNmxpeAsBOGatNsBiWJyp8o4mzhC6XQLjnpS433ADQ9WQLBbV2miQ75hzTzff_bS31x3VZ0W5BmWeiHLLxYf2vWtrJJANf_nr5MScvd51TBnLDnOhvB5EHRCf2t_O_HJpnnlmi2_kS2TMJdp8j88Y",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDvNTehOZEJ72TeP78-3hYlVME6rGNVxXEhxx0Xt853Zgxniw5EOs71UpX0Zy5M2w8lFh52JsFv-qn_y-g5n2_dwnP4JfCMtsswTgGkdxI9TWGKz7_iQa7VUZ1i1-8-sKsNfbie74j-4vaCCyJ7Kne1BvHQSsRTAg00zpqIcN7FMd864TZ2diaFUVmgvgywU6Ea8yYl98NFwzGyMiuli45ttxR4fCQxvqO2ciixmErrhxmwpCJsdpev",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBPcpQ_IwxkIGPY5rstxAM3c0GWlOO7HbxGP3Jyr1X3xvgTCIyFkyoaNO30hbxcj-Tdvw6untXLREcFxrgT3tEsXAfnz94NZ_ybqpBhlk6fiob3RU-it-hDeyQr2l2q4R7JdsiP6FMG5ppgu9iC6xcQj53jYe4RJ74Q2n3xDTqkYszCwiBVZ548NnnkBbyzpOixw7O0y3nk_X5zZenHv-a0eii0wrca-matNTedDrUcN89HFPge7rVu",
      ],
      sampleTrack: feed.shelves?.[0]?.items?.[5] || { id: "default", title: "Loading...", artist: "Senja Musik", duration: 180, thumbnail: "" },
    },
    {
      id: "mosaic-8",
      title: "Alunan Ketenangan Jiwa",
      trackCount: "38 lagu",
      creator: "Meditasi Harian",
      isVerified: true,
      category: "favorit",
      savesCount: "17.4k",
      creatorAvatar: "https://lh3.googleusercontent.com/aida/AEtjO1VY4KdWS7zOzoLqOa3TRPpttDSJm5qDTedUqM3bfzBv0Nbu3DcVaY0PuPRIKyEdrkir6ULFfxUGURZq6k1XvMkyOLaj4xtCyDnb66Csd9tHQisQ3BO30-DeJHIntN2edB7fHl6FcqUBfgroZgRiyW6lLPt0huSAurxthNtnE1EmvYPFO4W_T5AIb8Qiv1oQScaDnX_idvoMBgpSJ1pBg0e7D_0B_QYNr82Fuj24UaVARVwN3kOuZ-9Xvqg",
      covers: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDvhfoIgZgFahFnUU7WNpiAVmqZXoAKCApbKGufP-hRKQZJ7ahAm7OHI_ctM4j-7LI2J0Duj5ZXPDs033oeLUPj_O4ziOGmycU5UqJ9h6GZnsCMMoK-VGcsnM-Wk_kCOu5L_XH9VHAcpUbEDdBgfO_3wLq6IKjnb6e1otY1iGPN8tEIDjNs53rmOMsN4Yge9tTaLgOuGw4o00xScjtY1VGAsD2TGxaewkk8Cl9ri0askkSjpugck2Gm",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAdkZoCrZfylpdhXJgavAIoT4S4gqwTsqnHYExnQLVIXfwS_9PaWOMKoj-s9PC1u0S18rgvU4p-AynkhcxSFLtOXQqngwt0yaK5iV_PAw4mGTYqYDzBQz6YnZCMaM7Po5SyTvHS-dku1WiisgG1-tlzzOqIXo31n5fNG-yeFlkhEu17YkZKqUifhUmDwG54TfxsUw64_m9KBbWpMXQA6wUZBGF4xejhN2Kx7Z5zd9C1xzHHxR6OQVU1",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBHca2kanI4eleEfvdsOYjZu5gxk-kFrPpgagDpAlEpiHtarTvW4440D_WKmtJWSfLNQ9bh8PFnRvz0uKj-K7sBoL7hNzv26dgpGtba_FcwC1-ZarkcfENDiBbEJxQXiI2mMp1eMdah7q8VAM0rV7inYy7mh_tGEw6fSyC53W4W1UBpUDgNnraR8FR4NmnsOdUCtC5QnRWw_74l-N5I9ZS5eBX3j6ynl9B__j_EoocX_Tl6hsFq3OTm",
        "https://lh3.googleusercontent.com/aida/AEtjO1UnG_Vf7NqOA43VQ8H-S_RR0tjp-xvN3bwvYoqvtsnmJa-8KoiV93qPZ6RieS9UXUMIiAqBnyIVgK0JZlLCDZAEaTyQ-NR0nxpfRSjjOACeDgLbDxo_BjmaZsgoqACrLy2Bc4hWPGvJtVOkqxNaSwIQAvyZ7YfY_eRr0Kon8ejtnTtgsfqmL-oquZGonjz9S7ZYMan4z_Hjh00csf_vuYfAmwiAziQLxg_vdK240Q85wxBoeGFjjFctdA",
      ],
      sampleTrack: feed.nowPlayingInitial,
    },
    {
      id: "mosaic-9",
      title: "Mendayu di Tepi Pantai",
      trackCount: "30 lagu",
      creator: "Sari Pantai ID",
      isVerified: false,
      category: "terbaru",
      savesCount: "5.2k",
      creatorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-YIdwYDFPy-y1fQEMujKcMg44D-1cRu7N87MaBZ4qINKCQLb7YXvApYIumplzjbr5H13Ynd5QD21l9GwzUpkQTYjTOFrNknUbk_kxbzK0Ag35Pf64AaxewbkaRY4Gruzx5dr_F0RpYlvRc5VlKbLjByJ8R5GT99NE5X806guRz-AhcF53Fu8AKDcXJNHFmQQKXgGTgkrSWcg7fftoYSKkIC-EukADh3cC8vr3O-UkNfrffhSpgCJj",
      covers: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD7W1wqDyoCpJSrW-2wWCGnbJrvpCjhrtoi5fn7PaldRXe6a62IWtGYxUJYKRN0nOXSWfI86BguFjmko97YR_MrVSlWy3UODvtJS-FxpSwnS3tt_8-GtfVFcBiah7F-id-pA0AtnW5IAQuSVRiaGmFTUUbsveDDTCd6QXSjgwQ5hMr-oiI5fdvtGs7kDQX5ZSPKYOh4LhJJ3pDr9vT5Hk_W-jEZ0tDm9ZKVLJoZzjNvJuXJiPrA_J74",
        "https://lh3.googleusercontent.com/aida/AEtjO1VWZoti0TdjS4-lTXc30mtwF-5V5bQ6MZcvZJ_yyqcR6V_NIARkGcIVMG4lDBnVVZwjqKL4mKgdFV6SsylDisBSOhdmorh-EoCsqi10d-ke_o53xqWxJWtAgny1W_GbheNJHXw8nccO8Ppljg91Wc-HZ5r8pxXYGI0BES29zQFLdkaEc5xGMXjHhLrwHaMNbUWkL8E2a8jHh0dQbZe9dmbKpM2JYCCkKFf6RqBdMtvUUJ08MHoyz2lKD-o",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAaPx3lGnUS6jBOJoFEl1TdLboUkxZuKz6JKWQadgGHsV-02i0n3Hncu1wljnRW7kRiwIv7w5y9aF7FwIPN4t4xaqYIviel5IBx3rOPThQQKgZlj-u94VBSeueGBBngiO7vOXjGFqEVM48DkVicR5qO5QsDdxxVVIzK7fHoXQl1eRyK4dfKHlovLT-imIOcxgx5yEBbgDX3F9fyd5TEDsnmWW5UYNthNvptKBLmqHc7h-9jykurbnvY",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBPcpQ_IwxkIGPY5rstxAM3c0GWlOO7HbxGP3Jyr1X3xvgTCIyFkyoaNO30hbxcj-Tdvw6untXLREcFxrgT3tEsXAfnz94NZ_ybqpBhlk6fiob3RU-it-hDeyQr2l2q4R7JdsiP6FMG5ppgu9iC6xcQj53jYe4RJ74Q2n3xDTqkYszCwiBVZ548NnnkBbyzpOixw7O0y3nk_X5zZenHv-a0eii0wrca-matNTedDrUcN89HFPge7rVu",
      ],
      sampleTrack: feed.shelves?.[3]?.items?.[2] || { id: "default", title: "Loading...", artist: "Senja Musik", duration: 180, thumbnail: "" },
    },
    {
      id: "mosaic-10",
      title: "Nuansa Lofi Nusantara",
      trackCount: "45 lagu",
      creator: "ChillHop Jakarta",
      isVerified: true,
      category: "trending",
      savesCount: "28.9k",
      creatorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdNUYxGYihi4Z1zYx-YElwiNjn1t0yZKuKhFRIivdojfrGgF1_ssSw3G1zX5pXNpXxLVBsVc-n0zFRJxoH80nY0Ai0PLulNQJ6wMvWoOgSu8v-MmqwEtQz3Wg9EAIIOE1zTAMUiAMW4YstoTT_o6PepaL7CTc2MH7t-7tGhhlrP3gpPaViY5I_0LVk9xeLZiAMTnYsZb5zY4xJ770hTrIKg5JcIiDMalbvDdfdaALipZe7uokA7rdQ",
      covers: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCqZmyY2i5k52ndpLMYNuKZeCzYRIC0n_hP1q3Di2jrcPmtnu6kVOBzbewNf5_s5-GboTUL4lx83k_eOZl8Uw8MytCl3hPqv-WvyX0_xY0C3mDLsHC5XW4soahYpuZnZQo-m4Job5vgHxGJsvlyqL3clWrkjQxjm4oLUNJqvaq32fojbVraCpucMW8iPoZTR5Q1zpND0XOGHHOQcsmkWpMLFumJauPmIcsu0icNUtFISfugFLoO2KEX",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDvNTehOZEJ72TeP78-3hYlVME6rGNVxXEhxx0Xt853Zgxniw5EOs71UpX0Zy5M2w8lFh52JsFv-qn_y-g5n2_dwnP4JfCMtsswTgGkdxI9TWGKz7_iQa7VUZ1i1-8-sKsNfbie74j-4vaCCyJ7Kne1BvHQSsRTAg00zpqIcN7FMd864TZ2diaFUVmgvgywU6Ea8yYl98NFwzGyMiuli45ttxR4fCQxvqO2ciixmErrhxmwpCJsdpev",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDvhfoIgZgFahFnUU7WNpiAVmqZXoAKCApbKGufP-hRKQZJ7ahAm7OHI_ctM4j-7LI2J0Duj5ZXPDs033oeLUPj_O4ziOGmycU5UqJ9h6GZnsCMMoK-VGcsnM-Wk_kCOu5L_XH9VHAcpUbEDdBgfO_3wLq6IKjnb6e1otY1iGPN8tEIDjNs53rmOMsN4Yge9tTaLgOuGw4o00xScjtY1VGAsD2TGxaewkk8Cl9ri0askkSjpugck2Gm",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBHca2kanI4eleEfvdsOYjZu5gxk-kFrPpgagDpAlEpiHtarTvW4440D_WKmtJWSfLNQ9bh8PFnRvz0uKj-K7sBoL7hNzv26dgpGtba_FcwC1-ZarkcfENDiBbEJxQXiI2mMp1eMdah7q8VAM0rV7inYy7mh_tGEw6fSyC53W4W1UBpUDgNnraR8FR4NmnsOdUCtC5QnRWw_74l-N5I9ZS5eBX3j6ynl9B__j_EoocX_Tl6hsFq3OTm",
      ],
      sampleTrack: feed.shelves?.[0]?.items?.[3] || { id: "default", title: "Loading...", artist: "Senja Musik", duration: 180, thumbnail: "" },
    },
  ], [feed]);

  // Filtered playlists according to search query and active tab filter
  const filteredPlaylists = useMemo(() => {
    return basePlaylists.filter((pl) => {
      const matchesSearch =
        pl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pl.creator.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === "semua") return true;
      if (activeFilter === "trending") return pl.category === "trending";
      if (activeFilter === "terbaru") return pl.category === "terbaru";
      if (activeFilter === "favorit") return pl.category === "favorit";
      return true;
    });
  }, [basePlaylists, searchQuery, activeFilter]);

  // Currently visible items for infinite scroll
  const displayedPlaylists = useMemo(() => {
    return filteredPlaylists.slice(0, itemsCount);
  }, [filteredPlaylists, itemsCount]);

  // Infinite Scroll Intersection Observer
  useEffect(() => {
    if (!isCommunityOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && itemsCount < filteredPlaylists.length) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setItemsCount((prev) => {
              const next = prev + 4;
              if (next >= filteredPlaylists.length) {
                setHasMore(false);
              }
              return next;
            });
            setIsLoadingMore(false);
          }, 850);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTargetRef.current) {
      observer.observe(observerTargetRef.current);
    }

    return () => observer.disconnect();
  }, [isCommunityOpen, isLoadingMore, itemsCount, filteredPlaylists.length]);

  // Handle follow/save toggle
  const handleToggleSave = (e: React.MouseEvent, pl: CommunityPlaylistItem) => {
    e.stopPropagation();
    setSavedPlaylistIds((prev) => {
      const next = new Set(prev);
      if (next.has(pl.id)) {
        next.delete(pl.id);
        showToast(`Dihapus dari koleksi: "${pl.title}"`);
      } else {
        next.add(pl.id);
        showToast(`Disimpan ke koleksi: "${pl.title}" ✨`);
      }
      return next;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  if (!isCommunityOpen) return null;

  return (
    <div
      id="community-fullpage-modal"
      ref={scrollContainerRef}
      className="fixed inset-0 z-50 bg-[#0A0A0A] text-white flex flex-col overflow-y-auto pb-32 pt-4 px-4 sm:px-6 max-w-[440px] mx-auto w-full no-scrollbar select-none animate-in fade-in slide-in-from-bottom-3 duration-250 font-sans"
    >
      {/* Dynamic Ambient Blur Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-72 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent blur-3xl pointer-events-none -z-10"></div>

      {/* TOP HEADER */}
      <header className="flex items-center justify-between py-2 mb-3">
        <button
          onClick={() => setIsCommunityOpen(false)}
          title="Kembali ke Beranda"
          aria-label="Kembali"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.15] backdrop-blur-md border border-white/10 text-white shadow cursor-pointer transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>

        <div className="text-center">
          <span className="text-[10px] font-extrabold tracking-widest text-white/50 uppercase block">
            DIBUAT OLEH PENDENGAR LAIN
          </span>
          <div className="flex items-center justify-center space-x-1.5 mt-0.5">
            <h1 className="text-xl font-black text-white tracking-tight">
              Playlist Komunitas
            </h1>
            <span
              className="material-symbols-outlined text-[18px] text-white/70"
              title="Komunitas"
            >
              groups
            </span>
          </div>
        </div>

        {/* Counter Pill */}
        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/[0.08] backdrop-blur-md text-white/75 text-[11px] font-bold border border-white/10 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
          <span>128</span>
        </div>
      </header>

      {/* SEARCH BAR KHUSUS PLAYLIST KOMUNITAS */}
      <section className="mb-4">
        <div className="relative flex items-center w-full">
          <span className="absolute left-3.5 material-symbols-outlined text-[20px] text-white/60 pointer-events-none">
            search
          </span>
          <input
            type="text"
            id="community-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari playlist komunitas atau kreator..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.1] border border-white/10 focus:border-white/30 text-white placeholder-white/40 text-xs sm:text-sm font-medium outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              title="Hapus pencarian"
              aria-label="Bersihkan pencarian"
              className="absolute right-3 w-6 h-6 rounded-full flex items-center justify-center text-white/50 hover:text-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </section>

      {/* TAB FILTER HORIZONTAL PILL */}
      <section className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 mb-5">
        {[
          { key: "semua", label: "Semua" },
          { key: "trending", label: "Trending" },
          { key: "terbaru", label: "Terbaru" },
          { key: "favorit", label: "Genre favorit kamu" },
        ].map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveFilter(tab.key as any);
                setItemsCount(8);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-white text-black shadow-md scale-100"
                  : "bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white border border-white/5"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </section>

      {/* RESULT COUNT & STATUS */}
      <div className="flex items-center justify-between mb-3.5 px-0.5">
        <span className="text-xs font-bold text-white/50">
          Menampilkan {displayedPlaylists.length} dari {filteredPlaylists.length} playlist
        </span>
        <span className="text-[11px] text-white/70 font-semibold flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Live Sinkron</span>
        </span>
      </div>

      {/* GRID UTAMA 2 KOLOM (MOSAIC COLLAGE 2x2 KONSISTEN) */}
      <section className="grid grid-cols-2 gap-3 sm:gap-3.5">
        {displayedPlaylists.map((pl) => {
          const isSaved = savedPlaylistIds.has(pl.id);
          return (
            <div
              key={pl.id}
              onClick={() => {
                setSelectedCommunityPlaylist({
                  id: pl.id,
                  title: pl.title,
                  trackCount: pl.trackCount,
                  creator: pl.creator,
                  isVerified: pl.isVerified,
                  creatorAvatar: pl.creatorAvatar,
                  followers: pl.savesCount ? `${pl.savesCount} mengikuti` : "1.2rb mengikuti",
                  totalDuration: "2 jam 45 mnt",
                  covers: pl.covers,
                  sampleTrack: pl.sampleTrack,
                });
              }}
              className="group cursor-pointer select-none relative flex flex-col"
            >
              {/* Mosaic Collage 2x2 container */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden p-1 bg-black/40 border border-white/10 shadow-lg transition-transform duration-250 ease-out group-hover:scale-[1.04] active:scale-[0.98]">
                {/* 2x2 Grid foto lagu */}
                <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full">
                  {pl.covers.map((coverUrl, idx) => (
                    <div
                      key={idx}
                      className="w-full h-full rounded-[6px] overflow-hidden bg-[#161311]"
                    >
                      <img
                        src={coverUrl}
                        alt="song thumbnail"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>

                {/* Overlay gradient gelap tipis di seluruh collage */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30 pointer-events-none"></div>

                {/* Judul playlist ditulis besar bold menimpa di tengah collage */}
                <div className="absolute inset-0 flex items-center justify-center p-2.5 text-center pointer-events-none">
                  <h3 className="text-xs sm:text-sm font-black text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] tracking-tight">
                    {pl.title}
                  </h3>
                </div>

                {/* Tombol Follow/Simpan (ikon plus dalam lingkaran) muncul di pojok kanan atas tiap card saat di-hover */}
                <button
                  onClick={(e) => handleToggleSave(e, pl)}
                  title={isSaved ? "Tersimpan di koleksi" : "Simpan playlist"}
                  aria-label={isSaved ? "Hapus dari simpanan" : "Simpan playlist"}
                  className={`absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 z-20 cursor-pointer ${
                    isSaved
                      ? "bg-white text-black border-white shadow-md opacity-100"
                      : "bg-black/60 hover:bg-white hover:text-black border-white/20 text-white opacity-0 group-hover:opacity-100 active:scale-90"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[18px] sm:text-[20px]"
                    style={isSaved ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {isSaved ? "bookmark_added" : "add"}
                  </span>
                </button>

                {/* Badge kecil pojok kanan bawah: jumlah lagu dalam pill semi-transparan */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[9.5px] font-bold text-white/90 shadow-md">
                  {pl.trackCount}
                </div>

                {/* Quick Play Button overlay on hover bottom-left */}
                <div className="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
                  <span
                    className="material-symbols-outlined text-[18px] ml-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    play_arrow
                  </span>
                </div>
              </div>

              {/* Avatar pembuat playlist + nama user + badge centang terverifikasi */}
              <div className="flex items-center space-x-1.5 mt-2.5 px-0.5">
                <div className="relative w-5 h-5 rounded-full overflow-hidden border border-white/20 flex-shrink-0 bg-black">
                  <img
                    src={pl.creatorAvatar}
                    alt={pl.creator}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[11px] font-medium text-white/70 truncate group-hover:text-white transition-colors">
                  {pl.creator}
                </span>
                {pl.isVerified && (
                  <span
                    className="material-symbols-outlined text-sky-400 text-[13px] flex-shrink-0"
                    title="User Terverifikasi"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* SKELETON LOADING CARDS (muncul di baris paling bawah saat data baru sedang dimuat) */}
        {isLoadingMore && (
          <>
            {[1, 2].map((sk) => (
              <div key={sk} className="flex flex-col animate-pulse">
                {/* 2x2 Mosaic Skeleton Container */}
                <div className="relative aspect-square w-full rounded-2xl p-1 bg-white/[0.04] border border-white/10 shadow-lg">
                  <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full">
                    <div className="w-full h-full rounded-[6px] bg-white/[0.08]"></div>
                    <div className="w-full h-full rounded-[6px] bg-white/[0.06]"></div>
                    <div className="w-full h-full rounded-[6px] bg-white/[0.06]"></div>
                    <div className="w-full h-full rounded-[6px] bg-white/[0.08]"></div>
                  </div>
                  {/* Center Title skeleton */}
                  <div className="absolute inset-0 flex items-center justify-center p-3">
                    <div className="w-20 h-4 rounded-md bg-white/[0.15]"></div>
                  </div>
                  {/* Pill count skeleton */}
                  <div className="absolute bottom-2 right-2 w-12 h-3.5 rounded-full bg-white/[0.1]"></div>
                </div>

                {/* Creator info skeleton */}
                <div className="flex items-center space-x-1.5 mt-2.5 px-0.5">
                  <div className="w-5 h-5 rounded-full bg-white/[0.1] flex-shrink-0"></div>
                  <div className="w-16 h-3 rounded bg-white/[0.08]"></div>
                </div>
              </div>
            ))}
          </>
        )}
      </section>

      {/* EMPTY SEARCH STATE */}
      {filteredPlaylists.length === 0 && (
        <div className="py-16 text-center text-white/50 flex flex-col items-center">
          <span className="material-symbols-outlined text-[36px] text-white/20 mb-2">
            search_off
          </span>
          <p className="text-sm font-semibold text-white/70">
            Tidak menemukan playlist "{searchQuery}"
          </p>
          <p className="text-xs text-white/40 mt-1 max-w-[220px]">
            Coba kata kunci lain atau pilih tab filter yang berbeda
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveFilter("semua");
            }}
            className="mt-4 px-4 py-1.5 rounded-full bg-white/[0.08] text-xs font-bold text-white border border-white/15 cursor-pointer hover:bg-white/[0.15]"
          >
            Reset Pencarian
          </button>
        </div>
      )}

      {/* INFINITE SCROLL TARGET SENTINEL */}
      <div ref={observerTargetRef} className="h-6 w-full flex items-center justify-center mt-4">
        {hasMore && displayedPlaylists.length < filteredPlaylists.length && !isLoadingMore && (
          <button
            onClick={() => {
              setIsLoadingMore(true);
              setTimeout(() => {
                setItemsCount((prev) => prev + 4);
                setIsLoadingMore(false);
              }, 700);
            }}
            className="text-[11px] font-semibold text-white/40 hover:text-white transition-colors py-1 cursor-pointer"
          >
            Muat lebih banyak...
          </button>
        )}
      </div>

      {/* TOAST NOTIFICATION POPUP */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/90 backdrop-blur-xl border border-white/20 text-white text-xs font-bold shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
