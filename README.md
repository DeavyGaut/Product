# Product Assignment

################################# Generate Certificates and System Channel ###############################################

export PATH=${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}/configtx

cryptogen generate --config=./organizations/cryptogen/crypto-config-org1.yaml --output="organizations"
cryptogen generate --config=./organizations/cryptogen/crypto-config-org2.yaml --output="organizations"


cryptogen generate --config=./organizations/cryptogen/crypto-config-orderer.yaml --output="organizations"

configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock ./system-genesis-block/genesis.block

IMAGE_TAG=latest docker-compose -f docker/docker-compose-test-net.yaml 

############################################ Create Channel #####################################################

./network.sh createChannel -c mychannel

//It will create the channel artifacts, will connect peers to the channel and update anchor peers.

############################################ Deploy Chaincode #####################################################

./network.sh deployCC -ccn basic -ccp ../productDetails/chaincode/ -ccl javascript

//Here it will package the chaincode, install it on all the peers. Query the installed chaincodes. Approve it. and check the commit readiness.

############################################ Chaincode Interaction #####################################################

source ./scripts/setPeerConnectionParam.sh 1 2
//This will set the endorsing peers.
 
//Through the CLI container - We need to point to the organisation for which we need to invoke that means export the below mentioned variables.
 
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA -C mychannel -n basic $PEER_CONN_PARMS -c '{"function":"AddProduct","Args":["pi101","111", "11-12-2021", "11-12-2023"]}'
//This will invoke the add product function with following parameters.
 
peer chaincode query -C mychannel -n basic -c '{"Args":["ViewParticularProduct","pi101"]}'
//This will query the ViewParticularProduct function with following parameter.


//Similarly this could be done for subsequent functions as well.
