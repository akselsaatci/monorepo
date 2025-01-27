import { Suspense, useCallback } from "react";
import { graphql, usePaginationFragment } from "react-relay";

import { Button } from "@kampus/ui-next";

import { PostItem } from "~/app/pano/features/post-list/PostItem";
import { type PanoFeedFragment$key } from "./__generated__/PanoFeedFragment.graphql";

const fragment = graphql`
  fragment PanoFeedFragment on Viewer
  @argumentDefinitions(
    after: { type: "String" }
    first: { type: "Int", defaultValue: 10 }
    before: { type: "String" }
    last: { type: "Int" }
  )
  @refetchable(queryName: "PanoFeedPaginationQuery") {
    panoFeed(first: $first, after: $after, last: $last, before: $before)
      @connection(key: "PanoFeedFragment__panoFeed") {
      edges {
        cursor
        node {
          id
          ...PostItem_post
        }
      }
    }
  }
`;

interface Props {
  panoFeed: PanoFeedFragment$key;
}

export function PanoFeed(props: Props) {
  const { data, hasNext, hasPrevious, loadNext, loadPrevious } = usePaginationFragment(
    fragment,
    props.panoFeed
  );

  const feed = data.panoFeed;

  const loadPrevPage = useCallback(() => {
    if (hasPrevious) {
      loadPrevious(10);
    }
  }, [hasPrevious, loadPrevious]);

  const loadNextPage = useCallback(() => {
    if (hasNext) {
      loadNext(10);
    }
  }, [hasNext, loadNext]);

  return (
    <Suspense fallback="loading">
      <section className="flex flex-col gap-4">
        {feed?.edges?.map((edge) => {
          if (!edge?.node) {
            return null;
          }

          return <PostItem key={edge.node.id} post={edge.node} />;
        })}

        <div className="flex gap-2">
          <Button variant="secondary" onClick={loadPrevPage} disabled={!hasPrevious}>
            {"< Prev"}
          </Button>
          <Button variant="secondary" onClick={loadNextPage} disabled={!hasNext}>
            {"Next >"}
          </Button>
        </div>
      </section>
    </Suspense>
  );
}
