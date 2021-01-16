
import Head from 'next/head'
import Layout from '../components/layout'
import Loading from '../components/loading'
import { checkAuth } from '../components/data'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import { GetData, Log } from "../components/data";
import { toast } from "react-toastify";
export default function Home() {
  const userstate = useSelector((state) => state)
  const [state, setState] = useState({
    
    isLoading: true,
    nextAction: "get",
    currentPage: 1,
    allTotal: 0,
    selectedShopId: "",
    payload: {}
  })
  
  if (!userstate.username) {
    //setState({ ...state, isFirstCall: false, isLoading: true })
    //alway check auth before render
    checkAuth("/", JSON.parse(JSON.stringify(userstate))).then(rs=>{
      //console.log("after CheckAuth",rs)
    })
    return <></>
  } else {

    //=========== event handler:



    //=========================

      if (state.isLoading) {
        switch (state.nextAction) {
          case "get":
            GetData("shop", `lsi`, userstate).then(rs => {              
              if (rs.Status === 1) {
                try {
                  const data = JSON.parse(rs.Data)
                  setState({ ...state, isLoading: false, nextAction: "", Shops: data.Shops, selectedShopId: data.DefaultShopId })
                } catch (e) {
                  toast.error(e.message)
                }
              } else {
                toast.error(rs.Error)
              }
            })
            break;
          case "change":
            GetData("shop", `cs|${state.payload.shopid}`, userstate)
              .then(rs => {
                if (rs.Status === 1) {
                  setState({ ...state, isLoading: false, nextAction: "", selectedShopId: state.payload.shopid })
                } else {
                  toast.error(rs.Error)
                }

              });
            break;

          default: setState({ ...state, nextAction: "", isLoading: false });
        }
      }
    
    //=============

    return (
      <Layout>

        <Head>
          <title>C3M - Dashboard</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {state.isLoading && <Loading />}
        {state.Shops && state.Shops.length > 0 &&
          <div className="row">
            <div className="col-md-12 col-sm-12">
              <div className="panel with-scroll animated zoomIn">
                <div className="panel-heading clearfix">
                  <h3 className="panel-title ">Current Site</h3>
                </div>
                <div className="panel-body text-center">
                  {state.Shops.map((shop) =>
                    <div key={shop.ID} className={shop.ID != state.selectedShopId ? `hidden` : ``}>

                      <button type="button" className="btn btn-info btn-lg disabled">{shop.Name}</button>

                    </div>
                  )}



                </div>
              </div>
            </div>

            <div className="col-md-12 col-sm-12">
              <div className="panel with-scroll animated zoomIn">
                <div className="panel-heading clearfix">
                  <h3 className="panel-title">Select Site</h3>
                </div>
                <div className="panel-body text-center">
                  <div className="ng-scope">
                    {state.Shops.length > 0 && state.Shops.map((shop) =>

                      <span key={shop.ID} className={shop.ID == state.selectedShopId ? `hidden` : ``}>
                        <button key={shop.ID} type="button" onClick={() => setState({ ...state, nextAction: "change", isLoading: true, payload: { shopid: shop.ID } })} className="btn btn-default btn-lg margin-left margin-right">
                          {shop.Name}
                        </button>
                      </span>
                    )}


                  </div>
                </div>
              </div>
            </div>
          </div>
        }

      </Layout>
    )

  }
}

