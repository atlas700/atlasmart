import axios from "axios";
import { useRef } from "react";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";

interface Props {
  key: string | string[];
  query: string;
  initialData: any;
}

const useUnlimitedScrolling = ({ key, query, initialData }: Props) => {
  const lastPostRef = useRef<HTMLElement>(null);

  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  const { data, error, isLoading, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: typeof key === "string" ? [key] : [...key],
      queryFn: async ({ pageParam = 1 }) => {
        const { data } = await axios.get(`${query}&page=${pageParam}`);

        return data;
      },
      initialPageParam: 0,
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      initialData: { pages: [initialData], pageParams: [1] },
    });

  return {
    ref,
    entry,
    data,
    error,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
  };
};

export default useUnlimitedScrolling;
