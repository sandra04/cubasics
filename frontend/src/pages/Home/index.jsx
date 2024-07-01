import styled from 'styled-components'
import { useState, useEffect } from 'react'
import { Link, } from 'react-router-dom'

import { LinkForMainButton, LinkForSecondaryButton, Loader } from '../../utils/styles/Atoms'
import { formatStringDate, fetchData } from '../../utils/tools'

import { useToken } from '../../utils/hooks'

import Card from '../../components/Card'
import PageTitle from '../../components/PageTitle'



const HomeWrapper = styled.main`
  text-align:center;
  margin-bottom:150px;
  padding-top:60px;
`

const HomeHeader = styled.header`
    text-align:center;
    margin:40px auto 60px;
`
const HomeTitle = styled.h1`
  font-size:2.2em;
`

const HomeConnectWrapper = styled.section`
  background-color:#ffffff;
  width:80%;
  max-width:500px;
  margin:0 auto 100px;
  padding:60px 30px;
  display: flex;
  flex-wrap:wrap;
  justify-content:space-around;
`
const PostsSection = styled.section`
  width:90%;
  margin:0 auto 100px;
  @media (min-width:992px){
    width:80%;
  }
`
const PostsWrapper = styled.div`
  display: flex;
  flex-wrap:wrap;
  justify-content: space-between;
  text-align:left;
  margin-bottom:80px;
`

const ItemWrapper = styled(Link)`
    width:calc(100% - 60px);
    margin:15px;
    background-color:#ffffff;
    padding:30px;
    cursor:pointer;
    transition:300ms;
    text-decoration:none;
    color:#000000;
    &:hover{
      background-color:#d6d6d6;
    }
    @media (min-width:992px){
      width:calc(33% - 90px);
    }
`



function Home() {
  const { token } = useToken()
  const [postsListRecent, setPostsListRecent] = useState([])
  const [isDataRecentLoading, setDataRecentLoading] = useState(false)
  const [errorRecent, setErrorRecent] = useState(null)
  const [postsListSeen, setPostsListSeen] = useState([])
  const [isDataSeenLoading, setDataSeenLoading] = useState(false)
  const [errorSeen, setErrorSeen] = useState(null)
  
  
  async function fetchMostRecentPosts() {
    setDataRecentLoading(true)

    try {
      const res = await fetchData(`${process.env.REACT_APP_API_PATH}/api/post/get_most_recent`, {}, null)
    
      // http error
      if (!res.ok) {
          const message = `An error has occured: ${res.status} - ${res.statusText}`;
          setErrorRecent(true)
          throw new Error(message);
      }
      const data = await res.json();
      
          const result = {
              status: res.status + "-" + res.statusText,
              headers: {
                  "Content-Type": res.headers.get("Content-Type"),
                  "Content-Length": res.headers.get("Content-Length"),
              },
              data: data
          }
          let postsToModify = [...result.data]
          postsToModify.forEach((post) => {
              post.creation_date = formatStringDate(post.creation_date)
          })

          setPostsListRecent(postsToModify)
    }
    // Network error
    catch(err){
      if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
        setErrorRecent(true)
    }
    finally{
      setDataRecentLoading(false)
    }
  }


  async function fetchMostSeenPosts() {
    setDataSeenLoading(true)

    try {
      const res = await fetchData(`${process.env.REACT_APP_API_PATH}/api/post/get_most_seen`, {}, null)
    
      // http error
      if (!res.ok) {
          const message = `An error has occured: ${res.status} - ${res.statusText}`;
          setErrorRecent(true)
          throw new Error(message);
      }
      const data = await res.json();
      
      const result = {
          status: res.status + "-" + res.statusText,
          headers: {
              "Content-Type": res.headers.get("Content-Type"),
              "Content-Length": res.headers.get("Content-Length"),
          },
          data: data
      }
      let postsToModify = [...result.data]
      postsToModify.forEach((post) => {
          post.creation_date = formatStringDate(post.creation_date)
      })

      setPostsListSeen(postsToModify)
    }
    // Network error
    catch(err){
      if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
        setErrorSeen(true)
    }
    finally{
      setDataSeenLoading(false)
    }
  }

  useEffect(() => {
    fetchMostRecentPosts()
    fetchMostSeenPosts()
  }, [])

  

  return (
    <HomeWrapper>
      <PageTitle title="Cubasics - Votre forum dédié à la MAO" />
      <HomeHeader>
        <HomeTitle>Bienvenue dans ton nouveau forum préféré dédié à la MAO !</HomeTitle>
        <p>Ici on est tous trop sympa, alors n'hésite pas à poser tes questions !</p>
      </HomeHeader>
      {!token && <HomeConnectWrapper>
        <h2 style={ {marginBottom: "30px", marginTop: "0"} }>Je me connecte pour poser mes questions</h2>
        <LinkForMainButton to="/connexion">Je me connecte</LinkForMainButton>
        <LinkForSecondaryButton to="/inscription">Je m'inscris</LinkForSecondaryButton>
      </HomeConnectWrapper>}
      <PostsSection>
        <h2>Posts les plus récents</h2>
        {isDataRecentLoading ? (
          <Loader/>
        ) :
        (<PostsWrapper>
          {errorRecent ? <span>Oups, il y a eu un problème</span> :
          postsListRecent.map(({ id, title, content, category, creation_date, views, comments, favorites, user }) => 
            <ItemWrapper key={id} to={`/post/${id}`}>
              <Card
                title={title}
                category={category}
                content={content}
                date={creation_date}
                views={views}
                comments={comments}
                favorites={favorites}
                user={user}
                postType="post"
              />
            </ItemWrapper>
          )}
        </PostsWrapper>)}
        <h2>Posts les plus consultés</h2>
        {isDataSeenLoading ? (
          <Loader/>
        ) :
        (<PostsWrapper>
        {errorSeen ? <span>Oups, il y a eu un problème</span> :
          postsListSeen.map(({ id, title, content, category, creation_date, views, comments, favorites, user }) => 
            <ItemWrapper key={id} to={`/post/${id}`}>
              <Card
                title={title}
                category={category}
                content={content}
                date={creation_date}
                views={views}
                comments={comments}
                favorites={favorites}
                user={user}
                postType="post"
              />
            </ItemWrapper>
          )}
        </PostsWrapper>)}
      </PostsSection>
      <LinkForMainButton to="/posts">Voir tous les posts</LinkForMainButton>
    </HomeWrapper>
  );
}

export default Home;
