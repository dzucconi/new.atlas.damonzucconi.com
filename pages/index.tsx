import { Dropdown, Grid, PaneOption, Stack } from "@auspices/eos";
import type { NextPage } from "next";
import { gql } from "urql";
import { BottomNav } from "../components/core/BottomNav";
import { Loading } from "../components/core/Loading";
import { Meta } from "../components/core/Meta";
import { Pagination } from "../components/core/Pagination";
import { Thumbnail } from "../components/core/Thumbnail";
import { useIndexQuery } from "../generated/graphql";
import { usePagination } from "../lib/usePagination";

const Home: NextPage = () => {
  const { page, per } = usePagination();

  const [{ fetching, error, data }] = useIndexQuery({
    variables: { id: "atlas", page, per },
  });

  if (error) {
    throw error;
  }

  if (fetching || !data) {
    return <Loading />;
  }

  const {
    root: {
      collection: { slug, key, title, contents, counts },
    },
  } = data;

  return (
    <>
      <Meta title={title} />

      <Stack spacing={4}>
        <Stack>
          <Dropdown label={title} flex={1}>
            <PaneOption
              as="a"
              href={`https://glyph.labs.auspic.es/graph/${key}`}
              target="_blank"
            >
              data
            </PaneOption>

            <PaneOption
              as="a"
              href={`https://auspic.es/xs/${slug}`}
              target="_blank"
            >
              open in Auspic.es
            </PaneOption>
          </Dropdown>

          <Pagination page={page} per={per} total={counts.contents} href="/" />
        </Stack>

        <Grid>
          {contents.map((content) => {
            if (content.entity.kind === "Image")
              return (
                <Thumbnail
                  key={content.id}
                  contentId={content.id}
                  collectionId={slug}
                  entity={content.entity}
                />
              );
          })}
        </Grid>

        <BottomNav>
          <Pagination page={page} per={per} total={counts.contents} href="/" />
        </BottomNav>
      </Stack>
    </>
  );
};

export default Home;

gql`
  query IndexQuery($id: ID!, $page: Int, $per: Int) {
    root: object {
      ... on Collection {
        collection(id: $id) {
          id
          key
          slug
          title
          counts {
            contents
          }
          contents(page: $page, per: $per) {
            id
            entity {
              ...Thumbnail
            }
          }
        }
      }
    }
  }
`;
