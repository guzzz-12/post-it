import React, {useState, useEffect} from 'react'
import Comment from './Comment';
import AddComment from './AddComment';
import {CSSTransition, TransitionGroup} from "react-transition-group";

const Comments = ({ comments, onCreate, user, onDelete, sortComments, commentsChanged, resetCommentsChanged }) => {
  const [sort, setSort] = useState("asc");

  useEffect(() => {
    if(commentsChanged && selectRef.current){
      selectRef.current.selectedIndex = 0
      setSort("asc")
    } else if(!commentsChanged && selectRef.current) {
      sortComments(sort)
    }
     // eslint-disable-next-line
  }, [sort, commentsChanged])

  const onChangeHandler = (e) => {
    resetCommentsChanged()
    setSort(e.target.value)
  }

  const selectRef = React.createRef()

  return (
    <section className="Comments">
      <div className="Comments__header">
        {comments.length > 0 && comments.length === 1 && <h3>1 comment</h3>}
        {comments.length > 0 && comments.length > 1 && <h3>{comments.length} comments</h3>}
        <div className="Comments__header-select">
          <span><strong>Sort by:</strong></span>
          <select ref={selectRef} name="sortBy" onChange={onChangeHandler} value={sort}>
            <option value="asc">Older first</option>
            <option value="desc">Newest first</option>
          </select>
        </div>
      </div>
      <TransitionGroup>
        {comments.map(comment => {
          return (
            <CSSTransition key={comment.id} timeout={500} classNames="item">
              <Comment {...comment} currentUser={user} onDelete={onDelete}/>
            </CSSTransition>
          )
        })}
      </TransitionGroup>
      <AddComment onCreate={onCreate} />
    </section>
  )
}

export default Comments;
