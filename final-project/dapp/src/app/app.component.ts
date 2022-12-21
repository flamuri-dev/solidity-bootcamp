import { Component } from "@angular/core"
import { ethers } from "ethers"
import welcomyJson from "../assets/Welcomy.json"
import Moralis from "moralis"
import { EvmChain } from "@moralisweb3/common-evm-utils"

declare global {
  interface Window {
    ethereum: any
  }
}
const WELCOMY_ADDRESS = "0xC2Dc3Fc3DF09040b8e0C6d3470790EEc75F04841"

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  provider: any | undefined
  signer: any | undefined
  accounts: any | undefined
  wallet: ethers.Wallet | undefined
  claimable: boolean = false
  importedWallet: ethers.Wallet | undefined
  importedEnabled: boolean | undefined
  listEnabled: boolean | undefined
  reservationEnabled: boolean | undefined
  signerAddress: string | undefined
  apartments: any[] | undefined
  longitudes: string[] | undefined
  latitudes: string[] | undefined
  prices: string[] | undefined
  reservations: number[] | undefined
  apartmentsRes: number[] | undefined
  startRes: string[] | undefined
  endRes: string[] | undefined
  ownerPool: string | undefined
  welcomyContract: ethers.Contract | undefined
  welcomyAddress: string | undefined
  etherBalance: number | undefined
  apartmentNumber: number | undefined
  apartmentPrice: number | undefined
  clicked = false

  constructor() {
    this.longitudes = []
    this.latitudes = []
    this.prices = []
  }

  async createWallet() {
    this.provider = ethers.providers.getDefaultProvider("goerli")
    this.welcomyAddress = WELCOMY_ADDRESS
    this.wallet = ethers.Wallet.createRandom()
    this.signer = this.wallet.connect(this.provider)
    this.signerAddress = this.wallet.address
    this.welcomyContract = new ethers.Contract(
      this.welcomyAddress,
      welcomyJson.abi,
      this.signer
    )

    // get info after wallet is connected:

    this.updateInfo()
    this.getApartmentsInfo()
    this.displayOwnerPool()
  }

  enableGetReservations() {
    this.reservationEnabled = true
    this.listEnabled = true
  }

  enableList() {
    this.listEnabled = true
    this.reservationEnabled = false
  }

  disableList() {
    this.listEnabled = false
    this.reservationEnabled = false
  }

  enableImport() {
    this.importedEnabled = true
  }

  importWallet(privateKey: string) {
    this.provider = ethers.providers.getDefaultProvider("goerli")
    this.welcomyAddress = WELCOMY_ADDRESS
    if (privateKey) {
      this.wallet = new ethers.Wallet(privateKey, this.provider)
      this.signer = this.wallet.connect(this.provider)
      this.signerAddress = this.signer.getAddress()
      this.welcomyContract = new ethers.Contract(
        this.welcomyAddress,
        welcomyJson.abi,
        this.signer
      )

      // get info after wallet is connected:

      this.updateInfo()
      this.getApartmentsInfo()
      this.displayOwnerPool()

      this.importedEnabled = false
    }
  }

  async connectWallet() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum)
    this.welcomyAddress = WELCOMY_ADDRESS
    await this.provider.send("eth_requestAccounts", [])
    this.accounts = await this.provider.listAccounts()
    this.signer = await this.provider.getSigner()
    this.signerAddress = await this.signer.getAddress()
    this.welcomyContract = new ethers.Contract(
      this.welcomyAddress,
      welcomyJson.abi,
      this.signer
    )

    // get info after wallet is connected:

    this.updateInfo()
    this.getApartmentsInfo()
    this.displayOwnerPool()
  }

  // INFO FUNCTIONS

  private updateInfo() {
    if (this.signer) {
      this.signer.getBalance().then((balanceBN: ethers.BigNumberish) => {
        this.etherBalance = parseFloat(
          ethers.utils.formatEther(balanceBN)
        )
      })
    }
  }

  private async getApartmentsInfo() {
    if (this.welcomyContract) {
      this.apartmentNumber = await this.welcomyContract![
        "getNumberOfApartments"
      ]()
      console.log(
        `The number of apartments listed is ${this.apartmentNumber}\n`
      )

      if (this.apartmentNumber) {
        this.apartments = Array.from(Array(this.apartmentNumber).keys())

        function range(start: number, end: number) {
          var foo = []
          for (var i = start; i <= end; i++) {
            foo.push(i)
          }
          return foo
        }

        this.apartments = range(1, this.apartmentNumber)

        console.log(`array for card creation is: ${this.apartments}\n`)
      }

      if (this.apartmentNumber) {
        this.longitudes = []
        this.latitudes = []
        this.prices = []
        for (let i = 0; i < this.apartmentNumber; i++) {
          const coordinates = await this.welcomyContract![
            "getCoordinates"
          ](i)
          const longitude = coordinates[1]
          const latitude = coordinates[0]

          const apartmentData = await this.welcomyContract![
            "apartments"
          ](i)
          const price = ethers.utils.formatEther(apartmentData[0])
          // create the array of longitudes and latitudes to be used in html
          this.longitudes.push(longitude)
          this.latitudes.push(latitude)
          this.prices.push(price)

          console.log(
            `The coordinates of apartment ${i} is longitude: ${longitude}, latitude: ${latitude}, price: ${price} \n`
          )
        }
      }
    }
  }

  async displayOwnerPool() {
    if (this.welcomyContract) {
      const balanceBN = await this.welcomyContract["unclaimedEth"](
        this.signerAddress
      )
      this.ownerPool = ethers.utils.formatEther(balanceBN)
      this.claimable = balanceBN > 0
      console.log(`The owner pool has (${this.ownerPool}) ETH \n`)
    }
  }

  // CALL FUNCTIONS

  async listApartment(
    longitude: string,
    latitude: string,
    pricePerNight: string
  ) {
    let tx = await this.welcomyContract!["listApartment"](
      longitude,
      latitude,
      ethers.utils.parseEther(pricePerNight)
    )
    console.log(tx)
    const receipt = await tx.wait()
    console.log(`Apartment Listed (${receipt.transactionHash})\n`)

    // update informations
    this.updateInfo()
    this.getApartmentsInfo()
    this.displayOwnerPool()
  }

  async makeReservation(
    aptNumber: number,
    dateStart: string,
    dateEnd: string
  ) {
    console.log(
      `Apartment data information for make transaction rental! ${aptNumber}, ${dateStart}, ${dateEnd} \n`
    )

    const apartmentId = aptNumber - 1
    const checkinArray = dateStart.split("-")
    const checkoutArray = dateEnd.split("-")

    const apartmentData = await this.welcomyContract!["apartments"](
      apartmentId
    )

    this.apartmentPrice = apartmentData[0]

    if (this.apartmentPrice) {
      console.log(
        `Apartment data information for price ${this.apartmentPrice} \n`
      )

      const dayStart = checkinArray[2]
      const monthStart = checkinArray[1]
      const yearStart = checkinArray[0]
      const dayEnd = checkoutArray[2]
      const monthEnd = checkoutArray[1]
      const yearEnd = checkoutArray[0]

      const date_start = new Date(dateStart)
      const date_end = new Date(dateEnd)

      const Difference_In_Time = date_end.getTime() - date_start.getTime()
      const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24)

      console.log(
        `Apartment days information for calculate final price ${Difference_In_Days} \n`
      )

      let tx = await this.welcomyContract!["makeReservation"](
        apartmentId,
        dayStart,
        monthStart,
        yearStart,
        dayEnd,
        monthEnd,
        yearEnd,
        {
          value: this.apartmentPrice * Difference_In_Days,
        }
      )
      console.log(tx)
      const receipt = await tx.wait()
      console.log(`Apartment Rented! (${receipt.transactionHash})\n`)
    }

    // update informations
    this.updateInfo()
    this.getApartmentsInfo()
    this.displayOwnerPool()
  }

  async withdrawMoney(amount: string) {
    if (this.welcomyContract) {
      const tx = await this.welcomyContract["withdrawMoney"](
        ethers.utils.parseEther(amount)
      )
      const receipt = await tx.wait()
      console.log(`Withdrawal confirmed (${receipt.transactionHash})\n`)
      this.updateInfo()
      this.getApartmentsInfo()
      this.displayOwnerPool()
    }
  }

  async getReservations() {
    let reservations: number[]
    this.apartmentsRes = []
    this.startRes = []
    this.endRes = []
    reservations = []
    await Moralis.start({
      apiKey: "MORALIS_API_KEY", // Change this to your Moralis API Key
    })

    const address = WELCOMY_ADDRESS

    const chain = EvmChain.GOERLI

    const response = await Moralis.EvmApi.nft.getNFTOwners({
      address,
      chain,
    })

    for (let i = 0; i < response.raw.result!.length; i++) {
      if (
        response.raw.result![i].owner_of ===
        this.signerAddress!.toLowerCase()
      ) {
        reservations.push(Number(response.raw.result![i].token_id))
      }
    }

    this.reservations = reservations

    if (this.welcomyContract) {
      for (let i = 0; i < reservations.length; i++) {
        let reservationsData = await this.welcomyContract[
          "reservations"
        ](reservations[i])

        const id = reservationsData.apartmentId.toNumber()

        const start = reservationsData.start.toNumber()
        const end = reservationsData.end.toString()

        const date_start = new Date(start * 1000)
        const date_end = new Date(end * 1000)

        const day_start = date_start.toLocaleDateString()
        const day_end = date_end.toLocaleDateString()

        this.apartmentsRes.push(id)
        this.startRes.push(day_start)
        this.endRes.push(day_end)

        let apartmentData = await this.welcomyContract["apartments"](id)
        let latitude = apartmentData.coordinates[0]
        let longitude = apartmentData.coordinates[1]

        // console.log(
        //   `You have reserved the apartment number ${id} from ${day_start} to ${day_end}, that have these coordinates, latitude ${latitude} and longitude ${longitude} \n`
        // )
      }
    }
  }

  async rateStay(
    reservationNumber: number,
    rating: string,
    message: string
  ) {
    let tx = await this.welcomyContract!["rateStay"](
      reservationNumber,
      Number(rating),
      message
    )
    console.log(tx)
    const receipt = await tx.wait()
    console.log(`Rate submitted (${receipt.transactionHash})\n`)

    // update informations
    this.updateInfo()
  }
}