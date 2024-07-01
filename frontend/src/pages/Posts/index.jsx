import styled from 'styled-components'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { LinkForMainButton, SecondaryButton, Loader } from '../../utils/styles/Atoms'
import { formatStringDate, encodeStringInput, fetchData } from '../../utils/tools'

import Card from '../../components/Card'
import Search from '../../components/Search'
import PageTitle from '../../components/PageTitle'



const PostsWrapper = styled.section`
  width:90%;
  margin:0 auto;
  display: flex;
  flex-wrap:wrap;
  padding:60px 0 150px;
  justify-content: center;
  @media (min-width:992px){
    width:80%;
  }
`
const PostsHeader = styled.header`
    text-align:center;
    margin-bottom:20px;
    font-size:1.4em!important;
`

const SearchWrapper = styled.div`
  width:100%;
  margin-bottom:60px;
  text-align:center;
`

const DisplayFiltersLink = styled.p`
  margin-top: 50px;
  cursor: pointer;
  text-decoration: underline;
  &:hover{
    text-decoration:none;
  }
`

const Filters = styled.section`
  width:100%;
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
`

const FalseLink = styled.p`
    text-decoration: underline;
    cursor: pointer;
    text-align: center;
    margin-bottom: 50px;
    font-size: 0.8em;
    &:hover{
      text-decoration: none;
    }
`

const NewSubject = styled.div`
  width:100%;
  text-align:center;
    margin-bottom: 80px;
`

const PostsContainer = styled.div`
  width:100%;
  display:flex;
  flex-wrap:wrap;
  justify-content:left;
`

const ItemWrapper = styled(Link)`
  box-sizing: border-box;
  width:calc(100% - 30px);
  margin:15px;
  margin-bottom:30px;
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
    width:calc(33% - 30px);
  }
`


function Posts() {
  const [displayFilters, setDisplayFilters] = useState(false)
  const [categoriesList, setCategoriesList] = useState([])
  const [postsList, setPostsList] = useState([])
  const [isDataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState(null)
  const [postFilters, setPostFilters] = useState({search:"", category:[], order:"recent"})



  function selectCategoryFilter(e, selectedCategory){
    e.target.classList.toggle('active-filter')
    let filters = {...postFilters}

    if (filters.category.length > 0){
      const isCategoryInFilters = filters.category.find((currentCategory) => currentCategory === selectedCategory)
      if (isCategoryInFilters) {
        const newCategories = filters.category.filter(
          (currentCategory) => currentCategory !== selectedCategory
        )
        filters.category = [...newCategories]
      }
      else{
        filters.category.push(selectedCategory)
      } 
    }
    else{
      filters.category.push(selectedCategory)
    }
    setPostFilters({...filters})
  }


  function orderResults(orderBy){
    let filters = {...postFilters}
    filters.order = orderBy
    setPostFilters({...filters})
  }


  function clearCategoryFilter(){
    const categoryFilters = document.getElementsByClassName("category-filter")
    Object.keys(categoryFilters).forEach((key) => categoryFilters[key].classList.remove('active-filter'))
    let filters = {...postFilters}
    filters.category=[]
    setPostFilters({...filters})
  }

       
 
  async function fetchCategories() {

    try {
      const res = await fetchData(`/api/post/categories`, {}, null)

      // http error
      if (!res.ok) {
          const message = `An error has occured: ${res.status} - ${res.statusText}`;
          setError(true)
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
      const fetchedCategories = result.data.map((element)=> element.category)
      setCategoriesList(fetchedCategories)
    }
    // Network error
    catch(err){
      if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
        setError(true)
    }

  }


  async function fetchPosts() {
    setDataLoading(true)

    const filterData = {
      title: encodeStringInput(postFilters.search),
      category: postFilters.category,
      order: postFilters.order
    }

    try {
      const res = await fetchData(`/api/post/get`, filterData, null)
        
      // http error
      if (!res.ok) {
          const message = `An error has occured: ${res.status} - ${res.statusText}`;
          setError(true)
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

      setPostsList(postsToModify)
    }
    // Network error
    catch(err){
      if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
        setError(true)
    }
    finally{
      setDataLoading(false)
    }
  }


  useEffect(() => {
      fetchCategories()
  }, [])
  useEffect(() => {
      fetchPosts()
  }, [postFilters])

 


  if (error) {
    return <span>Oups, il y a eu un problème</span>
  }

  return (
    <PostsWrapper>
      <PageTitle title="Cubasics - Posts du forum dédié à la MAO" />
      <PostsHeader>
          <h1>Voir les échanges de la communauté :</h1>
      </PostsHeader>
      <SearchWrapper>
        <Search filters={postFilters} setFilters={setPostFilters}/>
          {displayFilters ? (<DisplayFiltersLink onClick={() => setDisplayFilters(!displayFilters)}>Masquer les filtres</DisplayFiltersLink>) : (<DisplayFiltersLink onClick={() => setDisplayFilters(!displayFilters)}>Afficher les filtres</DisplayFiltersLink>)}
        {displayFilters &&
          <div>
            <div style={ {marginTop:"50px"} }>
              <p style={ {textAlign:'center', fontWeight:700} }>Filtrer par catégorie :</p>
              <Filters>
              {categoriesList.map((category, index) => 
                  <div key={`${category}-${index}`}>
                      <SecondaryButton className="category-filter" style={ {margin: "10px"} } onClick={(e)=> selectCategoryFilter(e, category)}>{category}</SecondaryButton>
                  </div>
              )}
              </Filters>
              <FalseLink onClick={clearCategoryFilter}>Réinitialiser les filtres</FalseLink>
          </div>
          <div style={ { textAlign:'center' }}>
            <p style={ {textAlign:'center', fontWeight:700} }>Trier les résultats :</p>
              <select
                  name="order-results"
                  id="order-results"
                  value={postFilters.order}
                  onChange={(e) => orderResults(e.target.value)}
              >
                  <option value="recent">Par date (du plus récent au plus ancien)</option>
                  <option value="views">Par vue (du plus au moins consulté)</option>
                  <option value="comments">Par commentaires (du plus au moins commenté)</option>
              </select>
          </div>
        </div>}
      </SearchWrapper>
      <NewSubject>
        <h2 style={ {marginBottom:"30px"} }>Vous souhaitez poster un nouveau sujet ?</h2>
        <LinkForMainButton to={"/new_post"}>Créer un nouveau post</LinkForMainButton>
      </NewSubject>
      {isDataLoading ? (
        <Loader/>
      ) : (
        <PostsContainer>
          {postsList.map(({ id, title, content, category, creation_date, views, comments, favorites, user }) => 
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
      </PostsContainer>
    )}
    </PostsWrapper>
  )
}
  
export default Posts;