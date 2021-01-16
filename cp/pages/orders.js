import Link from 'next/link'
import { checkAuth } from '../components/data'
import { useSelector, useDispatch } from 'react-redux'
import Head from 'next/head'
import { useState } from 'react'
import { GetData, Log } from "../components/data";
import Layout from '../components/layout'
import Loading from '../components/loading'
import { toast } from "react-toastify";
import NumberFormat from 'react-number-format';

export default function Orders() {
  const userstate = useSelector((state) => state)


  const [state, setState] = useState({

    isLoading: true,
    nextAction: "get",
    currentPage: 1,
    allTotal: 0,
    selectedStatus: "all"
  })


  //=========== event handler:

  //=========================

  //alway check auth before render

  if (!userstate.username) {
    checkAuth("/orders", JSON.parse(JSON.stringify(userstate)))
    return <></>
  } else {
    if (state.isLoading) {
      switch (state.nextAction) {
        case "get":
          GetData("ord", `all|${state.selectedStatus},${state.currentPage},50`, userstate).then(rs => {
            if (rs.Status === 1) {
              try {
                const data = JSON.parse(rs.Data)
                state.selectedStatus == "all" && (data["allTotal"] = data["Total"])
                setState({ ...state, isLoading: false, nextAction: "", ...data })
              } catch (e) {
                toast.error(e.message)
              }
            } else {
              toast.error(rs.Error)
            }
          })
          break;
        case "change":
          const page = state.page || 1
          const selectedStatus = state.selectedStatus || "all"
          GetData("ord", `lao|${state.selectedStatus},${state.currentPage},50`, userstate).then(rs => {
            if (rs.Status === 1) {
              try {
                const data = JSON.parse(rs.Data)
                setState({ ...state, isLoading: false, nextAction: "", ...data })
              } catch (e) {
                toast.error(e.message)
              }
            } else {
              toast.error(rs.Error)
            }

          })
          break;

        default: setState({ ...state, isLoading: false });
      }
    }

    //==============
    return (
      <Layout>

        <Head>
          <title>C3M - Orders</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>



        {state.isLoading && <Loading />}

        {state.Orders &&
          <div className="al-content">
            <div className="panel with-scroll animated zoomIn">
              <div className="panel-heading clearfix">
                <h3 className="panel-title">Orders Management</h3>
              </div>
              <div className="panel-body" >
                <div className="ng-scope">
                  <div className="add-row-editable-table">
                    <ul className="btn-list clearfix ng-scope">
                      <li>
                        <button className="btn btn-primary btn-with-icon"><i
                          className="ion-android-add-circle"></i>Create order
                              </button>

                      </li>
                      <li>
                        <button type="button" className={`btn btn-default btn-with-icon ${state.selectedStatus == "all" ? "disabled" : ""}`}
                          onClick={() => state.selectedStatus != "all" && setState({ ...state, isLoading: true, nextAction: "get", selectedStatus: "all", currentPage: 1 })}
                        >
                          {!state.selectedStatus || state.selectedStatus == "all" &&
                            <i className="ion-android-checkmark-circle"></i>}
                                  All{" "}<b>({state.allTotal})</b>
                        </button>
                      </li>
                      {state.Status && Object.entries(state.Status).map(([k, status]) => (
                        <li key={k} title={status.Name}>

                          <button type="button"
                            onClick={() => state.selectedStatus !== status.ID && setState({ ...state, isLoading: true, nextAction: "change", selectedStatus: status.ID, currentPage: 1 })}
                            style={status.ID !== state.selectedStatus ? {
                              backgroundColor: `#${status.Color}`,
                              borderColor: `#${status.Color}`
                            }
                              : {
                                color: `#${status.Color}`,
                                borderColor: `#${status.Color}`
                              }}
                            className={`btn btn-default btn-with-icon ${status.ID === state.selectedStatus ? "disabled" : ""}`}
                          >
                            {status.ID === state.selectedStatus &&
                              <i className="ion-android-checkmark-circle"></i>}
                            {status.Title}{" "}<b>({status.OrderCount})</b>
                          </button>

                        </li>
                      ))
                      }
                    </ul>

                  </div>

                  <div className="horizontal-scroll">

                    <table className="table" style={{ color: "white" }} >
                      <thead>
                        <Paging />

                      </thead>
                      <thead>
                        <tr className="sortable">

                          <th st-sort="firstName">Name</th>
                          <th st-sort="lastName">Phone</th>
                          <th st-sort="username">Address</th>
                          <th st-sort="email">Total</th>
                          <th st-sort="age">Status</th>
                        </tr>
                        <tr>

                          <th><input st-search="firstName" placeholder="Search Name"
                            className="input-sm form-control search-input" type="search" /></th>
                          <th><input st-search="lastName" placeholder="Search Phone"
                            className="input-sm form-control search-input" type="search" /></th>
                          <th><input st-search="username" placeholder="Search Address"
                            className="input-sm form-control search-input" type="search" /></th>
                          <th><input st-search="email" placeholder="Search Total"
                            className="input-sm form-control search-input" type="search" /></th>
                          <th><input st-search="age" placeholder="Search Status"
                            className="input-sm form-control search-input" type="search" /></th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.Orders && state.Orders.length > 0 && Object.entries(state.Orders).map(([k, order]) => (
                          <tr className="ng-scope" key={k}>
                            <td className="ng-binding" style={{ textAlign: "left" }}>
                              {state.editOrderId === k
                                ? <input className={"editable-input form-control"} value={state.Orders[k].Name} data-field={"Name"} data-key={k} onChange={editChange} />
                                : <span>{state.Orders[k].Name}</span>
                              }
                            </td>
                            <td className="ng-binding">
                              {state.editOrderId === k
                                ? <input className={"editable-input form-control"} value={state.Orders[k].Phone} data-field={"Phone"} data-key={k} onChange={editChange} />
                                : <span>{state.Orders[k].Phone}</span>
                              }
                            </td>
                            <td className="ng-binding">
                              {state.editOrderId === k
                                ? <div>
                                  <input className={"editable-input form-control"} value={state.Orders[k].Address} data-field={"Address"} data-key={k} onChange={editChange} />
                                  {appstate.Shop.Config.DefaultLang && appstate.Shop.Config.DefaultLang === "vi" &&
                                    <div>
                                      {/*<input className={"editable-input form-control"} value={state.Orders[k].City} data-field={"City"} data-key={k} onChange={editChange} />*/}
                                      {/*<input className={"editable-input form-control"} value={state.Orders[k].District} data-field={"District"} data-key={k} onChange={editChange}/>*/}
                                      {/*<input className={"editable-input form-control"} value={state.Orders[k].Ward} data-field={"Ward"} data-key={k} onChange={editChange}/>*/}

                                      {geo &&
                                        <Select handleChange={() => handleCityChangeSelect}
                                          name={"City"}
                                          items={geo}
                                          value={state.Orders[k].City} />
                                      }
                                      {state.cityCode !== 0 &&
                                        <Select handleChange={() => handleDistrictChangeSelect}
                                          name={"District"}
                                          items={geo[state.cityCode].Districts}
                                          value={state.Orders[k].District}
                                          data={{ cityCode: state.cityCode }}
                                        //ref={selectDistrictEl}
                                        />
                                      }
                                      {state.cityCode !== 0 && state.districtCode !== 0 &&
                                        <Select handleChange={() => handleWardChangeSelect}
                                          name={"Ward"}
                                          items={geo[state.cityCode].Districts[state.districtCode].Wards}
                                          value={state.Orders[k].Ward}
                                          data={{ cityCode: state.cityCode, districtCode: state.districtCode }}
                                        //ref={selectWardEl}
                                        />

                                      }
                                    </div>
                                  }
                                </div>


                                : <div>
                                  <span>{order.Address}</span>

                                  <span>, {order.Ward}, {order.District}, {order.City}</span>

                                </div>
                              }
                            </td>
                            <td className="ng-binding" style={{ textAlign: "right" }}>
                              <NumberFormat value={order.Total} displayType={'text'} thousandSeparator={true} />
                            </td>
                            <td>

                              <button type="button" className="btn btn-default btn-xs " onClick={() => alert("demo")}>Status</button>
                              <button type="button" className="btn btn-default btn-xs margin-left" onClick={() => alert("demo")}>Edit</button>
                            </td>
                          </tr>

                        ))
                        }
                        {!state.Orders &&
                          <tr className="ng-scope">
                            <td className="ng-binding" colSpan={5}>No order.</td>

                          </tr>
                        }
                      </tbody>

                      <tfoot>
                        <Paging />

                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

      </Layout>
    )
  }

  function Paging() {
    if (state.Orders && state.PageCount && state.PageCount > 1)
      return (
        <tr>
          <td colSpan="6" className="text-center">
            <div st-pagination="" st-items-by-page="smartTablePageSize"
              st-displayed-pages="5"
              className="ng-isolate-scope">
              <nav className="ng-scope"
              >

                <ul className="pagination">
                  {Array(state.PageCount).fill(1).map((el, i) =>
                    <li className={`${state.currentPage == i + 1 ? "active" : ""}`} key={i} onClick={() => state.currentPage != (i + 1) && setState({ ...state, isLoading: true, nextAction: "change", currentPage: (i + 1) })} >
                      <a className="ng-binding">{i + 1}</a>
                    </li>
                  )}

                </ul>
              </nav>
            </div>
          </td>
        </tr>
      );
    return <></>
  }
}

