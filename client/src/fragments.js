import { gql } from "apollo-boost";

export const fragments = {
  postFields: gql`
    fragment PostFields on Post {
      title
      imageUrl
      description
      categories
      messageCount
      likes
    }
  `,
};
