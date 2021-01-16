
import Head from 'next/head'
import Layout from '../components/layout'
import Loading from '../components/loading'
import { checkAuth } from '../components/data'
import { useSelector } from 'react-redux'
import { useState } from 'react'


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
        const closeModal = () => {
            setState({ ...state, file: {}, templatename: "", modal: false })
        }
        const submitModal = () => {
            setState({ ...state, isLoading: true, nextAction: "create" })
        }
        const deleteTemplate = (tplName) => {

            var name = prompt("Are you sure delete \"" + tplName + "\" template? Type the template name to delete", "");
            name == tplName && setState({ ...state, isLoading: true, nextAction: "delete", payload: { name: tplName } })

        }
        const submitTemplate = (tplName) => {
            setState({ ...state, isLoading: true, nextAction: "submit", payload: { name: tplName } })

        }
        //=========================

        if (state.isLoading) {
            switch (state.nextAction) {
                case "get":
                    GetData("lptpl",`lat`, userstate).then(rs => {
                        console.log("data return", rs)
                        if (rs.Status === 1) {
                            try {
                                const data = JSON.parse(rs.Data)
                                setState({ ...state, isLoading: false, nextAction: "", Ptemplates: data.Ptemplates,Atemplates: data.Atemplates })
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
                                            <div className="userpic" onClick={() => { window.location = process.env.NEXT_PUBLIC_TESTLP_URL+`test/edit/${tpl.Path}` }}>
                                                <div className="userpic-wrapper">
                                                    <img src={process.env.NEXT_PUBLIC_TESTLP_URL+`templates/${tpl.Path}/screenshot.jpg`} />
                                                </div>
                                                {tpl.Status == 0 &&
                                                    <i onClick={e => { e.stopPropagation(); deleteTemplate(tpl.Name) }} className="ion-ios-close-outline ng-scope"></i>
                                                }
                                                <a className="change-userpic" >{tpl.Name} </a>
                                            </div>
                                            {(tpl.Status == 0) &&
                                                <button key={tpl.ID} type="button" onClick={() => submitTemplate(tpl.Name)} className="btn btn-default m-auto my-4">
                                                    Submit
                      </button>
                                            }
                                            {(tpl.Status == -1) &&
                                                <>
                                                    <div className="py-2 text-red-500">{tpl.Description}</div>
                                                    <button key={tpl.ID} type="button" onClick={() => submitTemplate(tpl.Name)} className="btn btn-default m-auto my-4">
                                                        ReSubmit
                      </button>
                                                </>
                                            }
                                            {(tpl.Status == 2) &&
                                                <button key={tpl.ID} type="button" disabled={true} className="btn btn-default m-auto my-4">
                                                    Waiting approve
                      </button>
                                            }
                                            {(tpl.Status == 1) &&
                                                <>
                                                    <div className="py-2">
                                                        Viewed: {tpl.Viewed} - Installed: {tpl.Installed}
                                                    </div>
                                                    <button key={tpl.ID} type="button" disabled="true" className="btn btn-default m-auto my-4">
                                                        Approve
                      </button>
                                                </>
                                            }

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

