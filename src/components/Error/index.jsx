
import styled from 'styled-components'


const ErrorWrapper = styled.div`
  width: 90%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding:60px 0;
`



function Error() {
    return (
    <ErrorWrapper>
        <h1>Oups...</h1>
        <div>
            <p>Il semblerait que la page que vous cherchez n’existe pas</p>
        </div>
    </ErrorWrapper>
    )
}
 
export default Error