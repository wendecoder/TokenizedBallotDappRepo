import { useState } from "react";
import * as tokenJson from "./assets/MyToken.json";
import * as tokenJson2 from "./assets/TokenizedBallot.json";
import { BigNumberish, BytesLike, ethers } from "ethers";
import type { NextPage } from "next";
import { useAccount, useBalance, useContractRead, useContractWrite, useNetwork } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";

const Home: NextPage = () => {
  const { address, isConnecting, isDisconnected } = useAccount();
  const { data, isError, isLoading } = useBalance({
    address: address,
  });
  console.log(address);
  const OpenModal = (params: { modalId: string }) => {
    const modal = document.getElementById(params.modalId) as HTMLDialogElement;
    modal.showModal();
  };

  function TokenName() {
    const { data, isError, isLoading } = address
      ? useContractRead({
          address: "0xC9eE6080Ce6D04584405938fecae2a5ae90e6667",
          abi: tokenJson.abi,
          functionName: "name",
        })
      : { data: null, isError: false, isLoading: false };
    const name = typeof data === "string" ? data : 0;
    if (isLoading) return <div>Fetching name...</div>;
    if (isError) return <div>Error fetching name</div>;
    return (
      <div className="flex gap-5">
        <span className="font-bold text-amber-400 -mt-1 text-lg">Token name:</span> {name}{" "}
      </div>
    );
  }
  function TokenBalance(params: { address: `0x${string}` }) {
    // Call useContractRead only if address is truthy
    const { data, isError, isLoading } = address
      ? useContractRead({
          address: "0xC9eE6080Ce6D04584405938fecae2a5ae90e6667",
          abi: tokenJson.abi,
          functionName: "balanceOf",
          args: [params.address],
        })
      : { data: null, isError: false, isLoading: false };

    const balance = data ? ethers.formatUnits(data as BigNumberish) : 0;

    if (isLoading) return <div>Fetching balance...</div>;
    if (isError) return <div>Error fetching balance</div>;

    // Display content only if address is provided
    if (address) {
      return (
        <div className="flex gap-5">
          <span className="font-bold text-amber-400 -mt-1 text-lg">Balance: </span> {balance}{" "}
          <span className="-ml-4">MTK</span>
        </div>
      );
    } else {
      return null; // or you can return an empty fragment <></>
    }
  }
  function TokenInfo(params: { address: `0x${string}` }) {
    // Display content only if address is provided
    if (address) {
      return (
        <div className="card w-1/2 -ml-14 bg-primary text-primary-content mt-4">
          <div className="card-body">
            <h2 className="card-title">Token Info</h2>
            <TokenName></TokenName>
            <TokenBalance address={params.address}></TokenBalance>
          </div>
          <div className="modal-action ">
            <form method="dialog">
              <button className="btn bg-red-500 hover:bg-red-700">Close</button>
            </form>
          </div>
        </div>
      );
    } else {
      return null; // or you can return an empty fragment <></>
    }
  }
  function PageBody() {
    return (
      <>
        <div className="block w-1/4 ml-10">
          <WalletInfo></WalletInfo>
        </div>
      </>
    );
  }
  function WalletInfo() {
    const { chain } = useNetwork();

    if (isLoading) return <div>Fetching balance</div>;
    if (isError) return <div>Error fetching balance</div>;
    if (address)
      return (
        <div className="flex flex-wrap gap-3 justify-around">
          <div className="card">
            <div className="card-body bg-red-300 rounded-lg">
              <p className="text-black font-bold">
                Your account address is: <span className="text-amber-600"> {address}</span>
              </p>
              <p className="text-black font-semibold">
                Connected to the network <span className="text-white font-bold">{chain?.name}</span>
              </p>
              <div className="card w-3/4 bg-primary text-primary-content">
                <div className="card-body">
                  <h2 className="card-title">Your Balance</h2>
                  Balance: {data?.formatted} {data?.symbol}
                </div>
              </div>
            </div>
          </div>

          {/* <WalletBalance address={address as `0x${string}`}></WalletBalance> */}
          {/* <TokenInfo address={address as `0x${string}`}></TokenInfo>
          <RequestToken address={address as `0x${string}`}></RequestToken> */}
        </div>
      );
    if (isConnecting)
      return (
        <div>
          <p>Loading...</p>
        </div>
      );
    if (isDisconnected)
      return (
        <div>
          <p>Wallet disconnected. Connect wallet to continue</p>
        </div>
      );
    return (
      <div>
        <p>Connect wallet to continue</p>
      </div>
    );
  }

  function DelegateTokens(params: { address: `0x${string}` }) {
    const [isError, setIsError] = useState<boolean | string>(false);

    const { write, data, isLoading, isSuccess } = useContractWrite({
      address: "0xC9eE6080Ce6D04584405938fecae2a5ae90e6667",
      abi: tokenJson.abi,
      functionName: "delegate",
    });

    return (
      <div className="card w-1/2 bg-slate-600">
        <div className="card-body rounded-lg">
          <div className="card-title font-bold text-xl text-white">
            <p className="text-center text-black">Delegate your tokens to get the vote to cast!</p>
          </div>
          <button
            className="btn btn-accent w-1/2 self-center"
            disabled={!write}
            onClick={() =>
              write({
                args: [params.address],
              })
            }
          >
            Delegate
          </button>
        </div>
        {isLoading && <p className="font-bold self-center">Loading...</p>}
        {isSuccess && (
          <p className="font-bold rounded-lg bg-green-500 p-2">Transaction: {JSON.stringify(data?.hash)}</p>
        )}
        {isError && <p className="font-bold">{isError}</p>}
        <div className="modal-action ">
          <form method="dialog">
            <button className="btn bg-red-500 hover:bg-red-700">Close</button>
          </form>
        </div>
      </div>
    );
  }
  function CastVote(params: { address: `0x${string}` }) {
    const { write, data, isLoading, isSuccess, isError } = useContractWrite({
      address: "0x712355D8F6FAE6F039fd089EEaC0Cc192E3253f3",
      abi: tokenJson2.abi, // Replace with the actual ABI
      functionName: "vote",
    });

    const [proposalIndex, setProposalIndex] = useState<number>();
    const [amountToVote, setAmountToVote] = useState<number>();

    return (
      <div className="card w-1/2 bg-slate-600">
        <div className="card-body rounded-lg">
          <div className="card-title font-bold text-xl text-white">
            <p className="text-center text-white font-bold">
              It's time to put your voting power to work!!{" "}
              <span className="text-amber-400">Cast your vote for your favorite Chocolate flavor</span>
            </p>
          </div>
          <div className="flex justify-around items-center mt-5 rounded-lg bg-amber-400">
            <p className="text-black font-semibold ml-16">0: chocoMint</p>
            <p className="text-black font-semibold">1: caramelDark</p>
            <p className="font-semibold text-black">2: raspberryBliss</p>
          </div>
          <div className="flex flex-wrap justify-around gap-2 rounded-lg">
            <p className="">Index of your proposal</p>
            <input
              type="number"
              placeholder="0"
              value={proposalIndex}
              onChange={e => setProposalIndex(Number(e.target.value))}
              className="h-8 rounded-md p-3 mt-4 text-black"
            />
          </div>
          <div className="flex flex-wrap justify-around gap-2 rounded-lg">
            <p>Amount of voting power to cast</p>
            <input
              type="number"
              placeholder="10"
              value={amountToVote}
              onChange={e => setAmountToVote(Number(e.target.value))}
              className="h-8 rounded-md p-3 mt-4 text-black"
            />
          </div>
          <button
            className="btn btn-accent w-1/2 self-center mt-10"
            disabled={!write}
            onClick={() => write({ args: [proposalIndex, ethers.parseUnits(String(amountToVote))] })}
          >
            Vote
          </button>
        </div>
        {isLoading && <p className="font-bold self-center">Loading...</p>}
        {isSuccess && (
          <p className="font-bold rounded-lg bg-green-500 p-2">Transaction: {JSON.stringify(data?.hash)}</p>
        )}
        {isError && <p className="font-bold">{isError}</p>}
        <div className="modal-action">
          <form method="dialog">
            <button className="btn bg-red-500 hover:bg-red-700">Close</button>
          </form>
        </div>
      </div>
    );
  }
  function QueryResult(params: { address: `0x${string}` }) {
    const { data, isError, isLoading } = address
      ? useContractRead({
          address: "0x712355D8F6FAE6F039fd089EEaC0Cc192E3253f3",
          abi: tokenJson2.abi,
          functionName: "winnerName",
        })
      : { data: null, isError: false, isLoading: false };
    return (
      <div className="card w-1/2 bg-base-100 shadow-xl">
        {data as BytesLike && (
          <div className="card-body">
            <h2 className="text-amber-400 font-bold text-center text-3xl">Winner of the voting is</h2>
            <p className="mt-14 font-semibold text-green-500 text-center bg-black p-4 rounded-lg  ">
              {ethers.decodeBytes32String(data as BytesLike)}
            </p>
          </div>
        )}

        {isLoading && <div>Fetching the winner...</div>}
        {isError && <div>An error occurred while fetching the winner name</div>}
        <div className="modal-action">
          <form method="dialog">
            <button className="btn bg-red-500 hover:bg-red-700">Close</button>
          </form>
        </div>
      </div>
    );
  }
  return (
    <>
      <MetaHeader />
      <dialog id="my_modal_1" className="modal">
        <TokenInfo address={address as `0x${string}`}></TokenInfo>
      </dialog>
      <dialog id="my_modal_2" className="modal">
        <RequestToken address={address as `0x${string}`}></RequestToken>
      </dialog>
      <dialog id="my_modal_3" className="modal">
        <DelegateTokens address={address as `0x${string}`}></DelegateTokens>
      </dialog>
      <dialog id="my_modal_4" className="modal">
        <CastVote address={address as `0x${string}`}></CastVote>
      </dialog>
      <dialog id="my_modal_5" className="modal">
        <QueryResult address={address as `0x${string}`}></QueryResult>
      </dialog>
      <div className="card-body bg-yellow-500 max-h-36 rounded-lg p-6 text-center text-4xl font-bold text-black">
        Welcome to the Decentralized Voting Platform
      </div>
      <p className="font-bold mx-auto bg-amber-400 p-5 rounded-lg text-black">Here we are!</p>
      <div className="flex flex-wrap justify-around gap-5 mt-16 ">
        <PageBody></PageBody>
        {/* Open the modal using document.getElementById('ID').showModal() method */}

        <ul className="menu bg-black w-1/4 rounded-box">
          <div className="flex flex-col items-center mt-5">
            <li>
              <button
                className="font-bold w-44 text-center hover:text-amber-400 text-lg p-2 px-3 bg-zinc-600 mb-3"
                onClick={() =>
                  OpenModal({
                    modalId: "my_modal_1",
                  })
                }
              >
                Check Token Info
              </button>
            </li>
            <li>
              <button
                className="font-bold w-44 text-center hover:text-amber-400 text-lg p-2 px-6 bg-zinc-600 mb-3"
                onClick={() =>
                  OpenModal({
                    modalId: "my_modal_2",
                  })
                }
              >
                Request Token
              </button>
            </li>
            <li>
              <a
                className="font-bold w-44 text-center hover:text-amber-400 text-lg p-2 px-3 bg-zinc-600 mb-3"
                onClick={() =>
                  OpenModal({
                    modalId: "my_modal_3",
                  })
                }
              >
                Delegate Tokens
              </a>
            </li>
            <li>
              <a
                className="font-bold w-44 text-center hover:text-amber-400 text-lg p-2 px-10 bg-zinc-600 mb-3"
                onClick={() =>
                  OpenModal({
                    modalId: "my_modal_4",
                  })
                }
              >
                Cast Votes
              </a>
            </li>
            <li>
              <a
                className="font-bold w-44 text-center hover:text-amber-400 text-lg p-2 px-7 bg-zinc-600 mb-3"
                onClick={() =>
                  OpenModal({
                    modalId: "my_modal_5",
                  })
                }
              >
                Query Result
              </a>
            </li>
          </div>
        </ul>

        <div className="w-1/4 bg-amber-400 rounded-lg text-center font-bold text-black py-6 overflow-y-auto max-h-96">
          <p className="text-2xl">Latest Votes</p>
          <div className="flex flex-col items-center">
            <div className="block bg-slate-400 rounded-lg mb-2 p-1 text-black font-bold">
              <p>Address: 0x0425894137514....</p>
              <p>Voted for: Proposal 1</p>
            </div>
            <div className="block bg-slate-400 rounded-lg mb-2 p-1 text-black font-bold">
              <p>Address: 0x0425894137514....</p>
              <p>Voted for: Proposal 1</p>
            </div>
            <div className="block bg-slate-400 rounded-lg mb-2 p-1 text-black font-bold">
              <p>Address: 0x0425894137514....</p>
              <p>Voted for: Proposal 1</p>
            </div>
            <div className="block bg-slate-400 rounded-lg mb-2 p-1 text-black font-bold">
              <p>Address: 0x0425894137514....</p>
              <p>Voted for: Proposal 1</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

function RequestToken(params: { address: `0x${string}` }) {
  const [data, setData] = useState<{ result: boolean }>();
  const [isLoading, setLoading] = useState(false);
  const body = { address: params.address };

  const refreshState = () => {
    setData(undefined);
  };

  return (
    <div className="card w-1/2">
      <div className="card-body bg-orange-400 rounded-lg">
        <div className="card-title font-bold text-black">
          Request for an amount of token in order to be eligible for voting
        </div>
        <button
          className="btn btn-active btn-neutral mt-4 bg-green-500"
          onClick={() => {
            setLoading(true);
            fetch("https://tokenized-ballot-backend-eftge72bo-wendecoders-projects.vercel.app/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            })
              .then(res => res.json())
              .then(result => {
                setData(result);
                setLoading(false);
              });
          }}
        >
          Request tokens
        </button>
        {isLoading && <p>Loading...</p>}
        {data && (
          <p
            className={`text-black font-semibold text-center text-lg ${
              data.result ? "text-green-700" : "text-red-500"
            }`}
          >
            Result from API:{" "}
            {data.result
              ? "You have successfully minted 10MTK Tokens. Delegate them to yourself in order to be eligible for voting."
              : "Failed"}
          </p>
        )}
        <div className="modal-action ">
          <form method="dialog">
            <button className="btn bg-red-500 hover:bg-red-700" onClick={refreshState}>
              Close
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;
