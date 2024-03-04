import styled from 'styled-components'
import { SecondaryButton } from '../../utils/styles/Atoms'


const SearchContainer = styled.form`
    width:100%;    
    display:flex;
    justify-content:center;
    margin-bottom:50px;
`


function Search({filters, setFilters}) {
    
    function searchElement(){
        const searchField = document.getElementById("search")
        const filtersToModify = {...filters}
        if (searchField.value !== "" && searchField.value !== " "){
          filtersToModify.search = searchField.value;
        }   
        else{
          filtersToModify.search = ""
        }
        setFilters({...filtersToModify})
      }


    return(
        <div>
            <SearchContainer onSubmit={e => e.preventDefault()}>
                <input id="search" type="text" style={ {marginRight:"10px", width:"200px"}} />
                <SecondaryButton onClick={searchElement}>Rechercher</SecondaryButton>
            </SearchContainer>
        </div>
    )
}

export default Search