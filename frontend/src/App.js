import React, { Component } from 'react';
import web3 from './web3.js';
import lottery from './lottery';
import { timingSafeEqual } from 'crypto';
import { runInThisContext } from 'vm';

class App extends Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: '',
  }

  async componentDidMount () {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.returnAllPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);

    this.setState({ manager, players, balance });
  }

  handleSubmit = async (event) => {
    const accounts = await web3.eth.getAccounts();

    this.setState({ message: "Transaction is pending. This can take a while, so please be patient. :) "})

    await lottery.methods.enter()
    .send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether')
    })
    .then(res => {
      this.setState({ message: "You are entered into the lottery! Good luck!!!!" });
    })
    .catch(err => {
      this.setState({ message: "The transaction was rejected. Try again." })
    });
  }
  render() {
    web3.eth.getAccounts();

    return (
      <div className="App">
        <h1>ETHER LOTTERY!!</h1>
        <p>This contract is managed by {this.state.manager}</p>
        <p>There are currently {this.state.players.length} people entered into the lottery, competing to win {web3.utils.fromWei(this.state.balance, 'ether')} ether!</p>
        <hr/>

        <div>
          <label htmlFor="amount">Amount of ether to enter:</label>
          <input
            type="text"
            onChange={event => this.setState({ value: event.target.value })}
          />
          <button onClick={this.handleSubmit}>Enter with {this.state.value} Ether</button>
        </div>

        <h3>{this.state.message}</h3>

      </div>
    );
  }
}

export default App;
