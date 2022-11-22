const getNFTData = async (contract, nftID) => {
    //Get nft uri
    try {
        let nftUri = await contract.methods.tokenURI(nftID).call();
        nftUri = `https://ipfs.io/ipfs/${nftUri.split('ipfs://')[1]}`;
        //Get json format
        let response = await fetch(nftUri);
        const jsonNft = await response.json();
        const imageURI = `https://ipfs.io/ipfs/${
            jsonNft.image.split('ipfs://')[1]
        }`;

        let traitValue = '';
        for (let traits in jsonNft.attributes) {
            traitValue += `*${jsonNft.attributes[traits].trait_type}:* \t${jsonNft.attributes[traits].value}\n`;
        }
        const owner = await contract.methods.minters(nftID).call();
        console.log(imageURI ? imageURI : 'does not exist');
        return { imageURI, owner, traitValue };
    } catch(err) {
        console.log(err)
        return false;
    }
};

module.exports = { getNFTData };
