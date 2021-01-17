
import Head from 'next/head'
import Layout from '../components/layout'
import Loading from '../components/loading'
import { checkAuth } from '../components/data'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import { encDat2, decDat } from "../components/crypto";
import Cookies from 'js-cookie'
import { GetData } from "../components/data";
import { toast } from "react-toastify";


export default function Lptemplate() {
    const userstate = useSelector((state) => state)

    const [state, setState] = useState({

        isLoading: true,
        nextAction: "get",
        file: "",
        templatename: "",
        modal: false,
        payload: {}
    })

    if (!userstate.username) {
        checkAuth("/", JSON.parse(JSON.stringify(userstate)))
        return <></>
    } else {
        //=========== event handler:

        const approveTemplate = (tplID) => {
            setState({ ...state, isLoading: true, nextAction: "approve", payload: { ID: tplID } })
        }
        const rejectTemplate = (tplID) => {
            setState({ ...state, isLoading: true, nextAction: "reject", payload: { ID: tplID } })
        }
        //=========================

        if (state.isLoading) {
            switch (state.nextAction) {
                case "get":
                    GetData("lptpl", `lat`, userstate).then(rs => {

                        if (rs.Status === 1) {
                            try {
                                const data = JSON.parse(rs.Data)
                                setState({ ...state, isLoading: false, nextAction: "", Ptemplates: data.Ptemplates, Atemplates: data.Atemplates })
                                return
                            } catch (e) {
                                toast.error(e.message)
                            }
                        } else {
                            toast.error(rs.Error)
                        }
                        setState({ ...state, isLoading: false, nextAction: "" })
                    })
                    break;
                case "reject":
                    GetData("lptpl", `rej|${state.payload.ID}`, userstate).then(rs => {
                        if (rs.Status === 1) {
                            try {
                                //remove template
                                const tpls = []
                                for (let i = 0, n = state.Ptemplates.length; i < n; i++) {
                                    if (state.Ptemplates[i].ID != state.payload.ID) {
                                        tpls.push(state.Ptemplates[i])
                                    }
                                }
                                setState({ ...state, isLoading: false, nextAction: "", Ptemplates: tpls })
                                return
                            } catch (e) {
                                toast.error(e.message)
                            }
                        } else {
                            toast.error(rs.Error)
                        }
                        setState({ ...state, isLoading: false, nextAction: "" })
                    })
                    break;
                case "approve":
                    GetData("lptpl", `ok|${state.payload.ID}`, userstate).then(rs => {
                        if (rs.Status === 1) {
                            try {
                                //remove template
                                const tpls = []
                                var apprtpl = {}
                                for (let i = 0, n = state.Ptemplates.length; i < n; i++) {
                                    if (state.Ptemplates[i].ID == state.payload.ID) {
                                        apprtpl = state.Ptemplates[i]
                                    } else {
                                        tpls.push(state.Ptemplates[i])
                                    }
                                }
                                const apprtpls = state.Atemplates || []
                                apprtpls.push(apprtpl)
                                setState({ ...state, isLoading: false, nextAction: "", Ptemplates: tpls, Atemplates: apprtpls })
                                return
                            } catch (e) {
                                toast.error(e.message)
                            }
                        } else {
                            toast.error(rs.Error)
                        }
                        setState({ ...state, isLoading: false, nextAction: "" })
                    })
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

                <div className="row">

                    <div className="col-md-12 col-sm-12">
                        <div className="panel with-scroll animated zoomIn">
                            <div className="panel-heading clearfix">
                                <div className="float-left"><h3 className="panel-title">Template Pending for test</h3></div>

                            </div>
                            <div className="panel-body text-center">
                                <div className="ng-scope">
                                    {state.Ptemplates && state.Ptemplates.length > 0 && state.Ptemplates.map((tpl) =>
                                        <div key={tpl.Name} className="mx-5 my-12 float-left">
                                            <div className="userpic" onClick={() => { window.open(process.env.NEXT_PUBLIC_TESTLP_URL + `test/edit/${encDat2(Cookies.get('_s') + "|" + tpl.Path)}`) }}>
                                                <div className="userpic-wrapper">
                                                    <img src={process.env.NEXT_PUBLIC_TESTLP_URL + `templates/${tpl.Path}/screenshot.jpg`} />
                                                </div>
                                              
                                                <a className="change-userpic" >{tpl.Name} - {tpl.User} </a>
                                            </div>

                                            <button type="button" onClick={() => approveTemplate(tpl.ID)} className="btn btn-default m-auto my-4">
                                                Approve
                      </button>
                                            <button type="button" onClick={() => rejectTemplate(tpl.ID)} className="btn btn-default m-auto my-4">
                                                Reject
                      </button>

                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="col-md-12 col-sm-12">
                        <div className="panel with-scroll animated zoomIn">
                            <div className="panel-heading clearfix">
                                <div className="float-left"><h3 className="panel-title">Template Approved</h3></div>

                            </div>
                            <div className="panel-body text-center">
                                <div className="ng-scope">
                                    {state.Atemplates && state.Atemplates.length > 0 && state.Atemplates.map((tpl) =>
                                        <div key={tpl.Name} className="mx-5 my-12 float-left">
                                            <div className="userpic" onClick={() => { window.location = process.env.NEXT_PUBLIC_TESTLP_URL + `test/edit/${encDat2(Cookies.get('_s') + "|" + tpl.Path)}` }}>
                                                <div className="userpic-wrapper">
                                                    <img src={process.env.NEXT_PUBLIC_TESTLP_URL + `templates/${tpl.Path}/screenshot.jpg`} />
                                                </div>
                                               
                                                <a className="change-userpic" >{tpl.Name} - {tpl.User} </a>
                                            </div>

                                            <div className="py-2 text-red-500">Viewed:{tpl.Viewed} - Installed:{tpl.Installed}</div>

                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>


                </div>


            </Layout>
        )

    }
}

