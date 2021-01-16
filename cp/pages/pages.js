
import Head from 'next/head'
import Layout from '../components/layout'
import Loading from '../components/loading'
import { checkAuth } from '../components/data'
import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import { GetData, Log } from "../components/data";
import { toast } from "react-toastify";
import titleize from "titleize"
import humanizeString from "humanize-string"
export default function Pages() {
  const userstate = useSelector((state) => state)
  const [state, setState] = useState({
    
    isLoading: true,
    nextAction: "get", 
    
    payload: {}
  })


  if (!userstate.username) {
    checkAuth("/", JSON.parse(JSON.stringify(userstate)))
    return <></>
  }else{


    if (state.isLoading) {
      switch (state.nextAction) {
        case "get":
          GetData("page", `la`, userstate).then(rs => {
            if (rs.Status === 1) {
              try {
                const data = JSON.parse(rs.Data)
                setState({ ...state, isLoading: false, nextAction: "", Pages:data })
              } catch (e) {
                toast.error(e.message)
              }
            } else {
              toast.error(rs.Error)
              setState({ ...state, isLoading: false, nextAction: "" })
            }
          })
          break;
        case "change":
          GetData("shop", `cs|${state.payload.shopid}`, userstate)
            .then(rs => {
              if (rs.Status === 1) {
                try {
                  const rsdata = JSON.parse(rs.Data)
                  setState({ ...state, isLoading: false, nextAction: "", ...rsdata })
                } catch (e) {
                  toast.error(e.message)
                }
              } else {
                toast.error(rs.Error)
                setState({ ...state, isLoading: false, nextAction: "" })
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
      {state.Pages &&
        <div className="row">
          
          <div className="col-md-12 col-sm-12">
            <div className="panel with-scroll animated zoomIn">
              <div className="panel-heading clearfix">
                <h3 className="panel-title">Select Page</h3>
              </div>
              <div className="panel-body text-center">
                <div className="ng-scope">
                  {state.Pages.length > 0 && state.Pages.map((item) =>
                  <span key={item.ID}>
                  {item.ID==state.selectedPageId&&
                    <button  type="button" className="btn btn-info btn-lg disabled">{titleize(humanizeString(item.Code))}</button>
                  }
                  {item.ID!=state.selectedPageId&&
                    <button  type="button" onClick={() => setState({ ...state, nextAction: "change", isLoading: true, payload: { shopid: item.ID } })} className="btn btn-default btn-lg margin-left margin-right">
                      {titleize(humanizeString(item.Code))}
                    </button>
                  }
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

