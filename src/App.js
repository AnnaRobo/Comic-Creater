import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import { useState, useEffect } from 'react';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import './pdf.js';
import React, { useRef } from 'react';
import { jsPDF } from 'jspdf';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return PageHeader();
}

let images = [''];
let imageDescription = [''];

function PageHeader() {
  const [pages, setPages] = useState(1);
  const [currentPage, setValue] = useState(1);
  const [image, setImage] = useState(images[currentPage - 1]);
  const [description, setDescription] = useState(imageDescription[currentPage - 1]);
  const [isLoading, setLoading] = useState(false);

  const [isHeaderExpanded, setHeaderExpanded] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shouldCollapse = scrollY > 0; // Adjust the threshold as needed

      setHeaderExpanded(!shouldCollapse);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  function incrementArray() {
    images.push('');
    imageDescription.push('');
    setPages(pages + 1);
  }
  const handleChange = (val) => {
    setValue(val);
    setImage(images[val - 1]);
    setDescription(imageDescription[val - 1]);
    setLoading(false);
  }

  async function query(data) {
    const response = await fetch(
      "https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud",
      {
        headers: {
          "Accept": "image/png",
          "Authorization": "Bearer VknySbLLTUjbxXAXCjyfaFIPwUTCeRXbFSOjwRiCxsxFyhbnGjSFalPKrpvvDAaPVzWEevPljilLVDBiTzfIbWFdxOkYJxnOPoHhkkVGzAknaOulWggusSFewzpqsNWM",
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    const result = await response.blob();
    return result;
  }
  function buttonClicked(i) {
    if (description != '') {
      setLoading(true);
      imageDescription[i] = description;
      query({ "inputs": description }).then((response) => {
        setLoading(false);
        const reader = new FileReader();
        reader.onload = function () {
          const dataURL = reader.result;
          images[i] = dataURL;
          setImage(dataURL);
        };
        reader.readAsDataURL(response);
      });
    }
  }
  function DeletePage(i) {
    if (images.length > 1) {
      images.splice(i - 1, 1);
      imageDescription.splice(i - 1, 1);
      setPages(pages - 1);
      if (i > 1) {
        handleChange(i - 1);
      }
      else {
        handleChange(1);
      }
    }
  }
  function ClearAll() {
    setPages(1);
    setValue(1);
    setImage('');
    setDescription('');
    setLoading(false);
    images = [''];
    imageDescription = [''];
  }

  const pdfRef = useRef();

  const handleExportToPdf = () => {
    const pdf = new jsPDF(
      // {
      //   format: {
      //     width: 190,
      //     height: 190
      //   }
      // }
      'p', 'mm', [190, 190]
    );


    // Loop through each image URL
    let proceedDownload = true;
    images.forEach((imageUrl, index) => {
      // Check if imageUrl is not empty or null
      if (imageUrl && imageUrl.length > 0) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          // Add the canvas to the PDF
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 3, 3, 184, 184);

          // Add a new page for the next image (if not the last image)
          if (index < images.length - 1) {
            pdf.addPage([190, 190]);
          }

          // Save or export the PDF after processing all images
          if (index === images.length - 1 && proceedDownload) {
            pdf.save('images.pdf');
          }
        };

        img.src = imageUrl;
      }
      else {
        proceedDownload = false;
        toast.warning("Incomplete comic", {
          position: toast.POSITION.TOP_LEFT,
        });
      }
    });
  };


  return (

    <div className='body'>

      <div className={`AppHeader ${isHeaderExpanded ? 'expanded' : 'collapsed'}`}>

        <div className='headerPageButtons'>
          <Button variant='transparent' style={{ color: 'white', fontSize: '18px' }} onClick={() => ClearAll()}>Create New Comic</Button>{' '}
          <ToggleButtonGroup id='toggleButtonGroup' type="radio" name='pagenumbers' value={currentPage} onChange={handleChange}>

            {Array.from({ length: pages }, (_, index) => (
              <ToggleButton key={index} id={index} variant='info' value={index + 1}>
                {index + 1}
              </ToggleButton>
            ))}

          </ToggleButtonGroup>
          <img id='newPageIcon' width="40" height="38" style={{ marginLeft: '20px' }} src="https://img.icons8.com/pastel-glyph/64/FFFFFF/add-file--v2.png" alt="add" onClick={incrementArray} />
          <Button id='newPageButton' variant='transparent' style={{ width: '100%', color: 'white', fontSize: '16px', border: '1px solid white' }} onClick={() => incrementArray()}>Add Page +</Button>{' '}

        </div>

        <div className='centerText'>
          {"Page " + currentPage}
          <div style={{ width: '40%', display: 'flex', justifyContent: 'flex-end' }}>
            <img width="36" height="36" src="https://img.icons8.com/sf-black-filled/64/FFFFFF/left.png" alt="left" style={{ marginRight: '20px' }} disabled={currentPage == 1} onClick={() => {if(currentPage>1) handleChange(currentPage - 1)}} />
            <img width="36" height="36" src="https://img.icons8.com/sf-black/64/FFFFFF/right.png" alt="right" style={{ marginRight: '20px' }} disabled={currentPage == images.length} onClick={() => {if(currentPage<pages) handleChange(currentPage + 1)}} />
            <img width="36" height="36" id='moreButton' src="https://img.icons8.com/ios-glyphs/30/FFFFFF/more.png" alt="more" onClick={()=>
            {
              if(isHeaderExpanded)  setHeaderExpanded(false);
              else                  setHeaderExpanded(true);
            }
          }/>
          </div>
        </div>



      </div>{' '}

      <div className='mainBody'>

        <div className='bodyButtons'>

          <textarea className='inputBox' id="desc" name="fname" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingLeft: '20px', paddingRight: '20px' }}>
            <Button variant='danger' style={{ width: '40%', }} disabled={isLoading} onClick={!isLoading ? () => DeletePage(currentPage) : null}>Delete Page</Button>
            <Button variant='primary' style={{ width: '40%', }} disabled={isLoading} onClick={!isLoading ? () => buttonClicked(currentPage - 1) : null}>Generate Image</Button>
          </div>
          <Button variant='info' style={{ margin: '20px' }} disabled={isLoading} onClick={!isLoading ? () => handleExportToPdf() : null}>Download as PDF</Button>
        </div>

        <div className='bodyImage'>
          <div style={{ backgroundColor: '#ebebeb', width: '95%', position: 'absolute' }}>
            <div style={{ paddingBottom: '100%', height: 0, border: '2px solid black' }}></div>
          </div>
          {image !== '' ? <img src={image !== '' ? image : "holder.js/100px250"} style={{ width: '93%', position: 'absolute', margin: '1%' }} /> : null}
        </div>
      </div>

      <div style={{ display: 'none', position: 'absolute', width: '100%', height: '100%', left: "100px", top: '100px' }} ref={pdfRef}></div>
    </div>
  );
}


export default App;
