// Récupère les valeurs "popularityType" et "popularityValue" lors de l'appel du composant dans "Post"
function PopularityInfos({ popularityType, popularityValue }) {
    const type =
    popularityType === 'views' ? (
        <span>👁️</span>
    ) : (
        popularityType === 'comments' ? (
            <span>💬</span>
        ) : (
            popularityType === 'favorites' ? (
                <span>❤️</span> 
            ) : (
                    null
                )
            )
        )

	return (
        <p style={ {margin:"0 20px 0 0"} }>{type} {popularityValue}</p>
	)
}

export default PopularityInfos