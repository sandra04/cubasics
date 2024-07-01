import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { SecondaryButton, LinkForMainButton, Loader } from '../../utils/styles/Atoms'
import { formatStringDate, encodeStringInput, fetchData } from '../../utils/tools'

import Card from '../../components/Card'
import Search from '../../components/Search'
import PageTitle from '../../components/PageTitle'



const ProjectsWrapper = styled.section`
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
const ProjectsHeader = styled.header`
  text-align:center;
  margin-bottom:20px;
  font-size:1.4em!important;
`

const SearchWrapper = styled.div`
  width:100%;
  margin-bottom:60px;
  text-align:center;
`

const ProjectsContainer = styled.div`
  width:100%;
  display:flex;
  flex-wrap:wrap;
  justify-content:left;
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

const ItemWrapper = styled(Link)`
  width:calc(100% - 60px);
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
    width:calc(33% - 90px);
  }
`


function Projects() {
  const [displayFilters, setDisplayFilters] = useState(false)
  const [profilesList, setProfilesList] = useState([])
  const [stylesList, setStylesList] = useState([])
  const [projectsList, setProjectsList] = useState([])
  const [isDataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState(null)
  const [projectFilters, setProjectFilters] = useState({search:"", profiles:[], styles:[], order:"recent"})


  function selectProfileFilter(e, selectedProfile){
    e.target.classList.toggle('active-filter')
    let filters = {...projectFilters}

    if (filters.profiles.length > 0){
      const isProfileInFilters = filters.profiles.find((currentProfile) => currentProfile === selectedProfile)
      if (isProfileInFilters) {
        const newProfiles = filters.profiles.filter(
          (currentProfile) => currentProfile !== selectedProfile
        )
        filters.profiles = [...newProfiles]
      }
      else{
        filters.profiles.push(selectedProfile)
      } 
    }
    else{
      filters.profiles.push(selectedProfile)
    }
    setProjectFilters({...filters})
  }


  function selectStyleFilter(e, selectedStyle){
    e.target.classList.toggle('active-filter')
    let filters = {...projectFilters}

    if (filters.styles.length > 0){
      const isStyleInFilters = filters.styles.find((currentStyle) => currentStyle === selectedStyle)
      if (isStyleInFilters) {
        const newStyles = filters.styles.filter(
          (currentStyle) => currentStyle !== selectedStyle
        )
        filters.styles = [...newStyles]
      }
      else{
        filters.styles.push(selectedStyle)
      } 
    }
    else{
      filters.styles.push(selectedStyle)
    }
    setProjectFilters({...filters})
  }


  function orderResults(orderBy){
    let filters = {...projectFilters}
    filters.order = orderBy
    setProjectFilters({...filters})
  }


  function clearProfileFilter(){
    const profileFilters = document.getElementsByClassName("profile-filter")
    Object.keys(profileFilters).forEach((key) => profileFilters[key].classList.remove('active-filter'))
    let filters = {...projectFilters}
    filters.profiles=[]
    setProjectFilters({...filters})
  }


  function clearStyleFilter(){
    const styleFilters = document.getElementsByClassName("style-filter")
    Object.keys(styleFilters).forEach((key) => styleFilters[key].classList.remove('active-filter'))
    let filters = {...projectFilters}
    filters.styles=[]
    setProjectFilters({...filters})
  }



  async function fetchProfiles() {

    try {
      const res = await fetchData(`/api/project/profiles`, {}, null)
    
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

      setProfilesList(result.data)
    }
    // Network error
    catch(err){
      if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
      setError(true)
    }
  }

  
  async function fetchStyles() {

    try {
      const res = await fetchData(`/api/project/styles`, {}, null)
       
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

      setStylesList(result.data)
    }

    // Network error
    catch(err){
      if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
      setError(true)
    }
  }

  
  async function fetchProjects() {
    setDataLoading(true)

    const filterData = {
      title: encodeStringInput(projectFilters.search),
      searchedProfiles: projectFilters.profiles,
      style: projectFilters.styles,
      order: projectFilters.order
    }

    try {
      const res = await fetchData(`/api/project/get`, filterData, null)
    
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
      let projectsToModify = [...result.data]
      projectsToModify.forEach((project) => {
          project.creation_date = formatStringDate(project.creation_date)
      })

      setProjectsList(projectsToModify)
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
    fetchProjects()
}, [projectFilters])
 
useEffect(() => {
    fetchProfiles()
    fetchStyles()
  }, [])


  if (error) {
    return <span>Oups, il y a eu un problème</span>
  }


  return (
    <ProjectsWrapper>
      <PageTitle title="Cubasics - Projets musicaux sur le forum" />
      <ProjectsHeader>
          <h1>Chercher un projet en cours :</h1>
      </ProjectsHeader>
      <SearchWrapper>
        <Search filters={projectFilters} setFilters={setProjectFilters}/>
        {displayFilters ? (<DisplayFiltersLink onClick={() => setDisplayFilters(!displayFilters)}>Masquer les filtres</DisplayFiltersLink>) : (<DisplayFiltersLink onClick={() => setDisplayFilters(!displayFilters)}>Afficher les filtres</DisplayFiltersLink>)}
        {displayFilters &&
            <div>
              <div style={ {marginTop:"50px"} }>
                <p style={ {textAlign:'center', fontWeight:700} }>Je suis :</p>
                <Filters>
                {profilesList?.map((profile, index) => 
                    <div key={`${profile}-${index}`}>
                        <SecondaryButton className="profile-filter" style={ {margin: "10px"} } onClick={(e)=> selectProfileFilter(e, profile)}>{profile}</SecondaryButton>
                    </div>
                )}
                </Filters>
                <FalseLink onClick={clearProfileFilter}>Réinitialiser le filtre profil</FalseLink>
              </div>
              <div style={ {marginTop:"50px"} }>
                <p style={ {textAlign:'center', fontWeight:700} }>Style de musique :</p>
                <Filters>
                {stylesList?.map((style, index) => 
                    <div key={`${style}-${index}`}>
                        <SecondaryButton className="style-filter" style={ {margin: "10px"} } onClick={(e)=> selectStyleFilter(e, style)}>{style}</SecondaryButton>
                    </div>
                )}
                </Filters>
                <FalseLink onClick={clearStyleFilter}>Réinitialiser le filtre style</FalseLink>
              </div>
              <div style={ { textAlign:'center' }}>
                <p style={ {textAlign:'center', fontWeight:700} }>Trier les résultats :</p>
                  <select
                      name="order-results"
                      id="order-results"
                      value={projectFilters.order}
                      onChange={(e) => orderResults(e.target.value)}
                  >
                      <option value="recent">Par date (du plus récent au plus ancien)</option>
                      <option value="views">Par vue (du plus au moins consulté)</option>
                  </select>
              </div>
            </div>}
        </SearchWrapper>
      <NewSubject>
        <h2 style={ {marginBottom:"30px"} }>Vous souhaitez collaborer sur un projet avec d'autres utilisateurs ?</h2>
        <LinkForMainButton to={"/new_project"}>Créer un nouveau projet</LinkForMainButton>
      </NewSubject>
      {isDataLoading ? (
        <Loader/>
      ) :
      (<ProjectsContainer>
        {projectsList?.map(({ id, title, creation_date, content, views, user }) => 
          <ItemWrapper key={id} to={`/projet/${id}`}>
            <Card
              title={title}
              date={creation_date}
              content={content}
              views={views}
              user={user}
              postType="projet"
            />
          </ItemWrapper>
        )}
      </ProjectsContainer>)}
    </ProjectsWrapper>
  )
}


  
export default Projects;