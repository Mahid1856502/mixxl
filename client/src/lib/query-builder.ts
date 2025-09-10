// utils/query-builder.ts
export function buildSearchQuery({
  search,
  genre,
  mood,
  sort,
}: {
  search?: string;
  genre?: string;
  mood?: string;
  sort?: string;
}) {
  const query: Record<string, string> = {};

  if (search && search.trim() !== "") {
    query.search = search.trim();
  }

  if (genre && genre !== "All") {
    query.genre = genre;
  }

  if (mood && mood !== "All") {
    query.mood = mood;
  }

  if (sort) {
    query.sort = sort;
  }

  return query;
}
