import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { newsApi } from '../api/news.api';

export const useNewsList = () =>
  useInfiniteQuery({
    queryKey: ['news-list'],
    queryFn: ({ pageParam = 1 }) => newsApi.list(pageParam as number),
    getNextPageParam: (lastPage, pages) => (lastPage.length ? pages.length + 1 : undefined),
    initialPageParam: 1,
  });

export const useNewsDetail = (id: string) =>
  useQuery({
    queryKey: ['news-detail', id],
    queryFn: () => newsApi.detail(id),
    enabled: Boolean(id),
  });
