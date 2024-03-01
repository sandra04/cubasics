import styled from 'styled-components'

import PopularityInfos from '../PopularityInfos'


/*const PostContainer = styled.div`
  display:flex;
  height:100%;
  flex-wrap:wrap;
  align-items:space-between;
`*/

const PostTitle = styled.h2`
  margin-bottom:10px;
  height:60px;
  overflow:hidden;
`
const PostInfos = styled.div`
    margin-bottom:40px;
    font-weight:700;
    color:#565656;
`

const PostContent = styled.div`
  font-style:italic;
  height:142px;
  overflow:hidden;
`

const PostInteractions = styled.div`
  display:flex;
  flex-wrap:wrap;
`


function Card({ title, category, date, content, views, comments, favorites, user, postType }){
  let formattedContent = content?.split("\r\n")
  formattedContent = content?.split("\n")

  return(
    <div>
      <PostTitle>{title}</PostTitle>
      <PostInfos>
          { postType==="post" && <p>Posté par {user}, le {date}, en catégorie "{category}"</p> }
          { postType==="projet" && <p>Posté par {user}, le {date}</p> }
      </PostInfos>
      <PostContent>
          {formattedContent.map((phrase, index) => <p key={index}>{phrase}</p>)}
      </PostContent>
      {/*{content}.slice(0,200) */}
      <p style={ {marginBottom:"40px"} }>...</p>
      <PostInteractions>
          <PopularityInfos popularityType="views" popularityValue={views} />
          { postType==="post" && <PopularityInfos popularityType="comments" popularityValue={comments} /> }
          { postType==="post" && <PopularityInfos popularityType="favorites" popularityValue={favorites} />}
      </PostInteractions>
    </div>
  )
}

export default Card;